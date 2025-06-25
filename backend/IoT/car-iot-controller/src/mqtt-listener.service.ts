import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { CarStatsService } from './car-stats.service';

@Injectable()
export class MqttListenerService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(MqttListenerService.name);
    private client: mqtt.MqttClient;
    private isConnected = false;
    private lastConnectAttempt = 0;

    constructor(private readonly carStatsService: CarStatsService) {}

    onModuleInit() {
        this.connectToMqtt();
    }

    onModuleDestroy() {
        if (this.client) {
            this.client.end();
            this.logger.log('MQTT client disconnected');
        }
    }

    getHealth() {
        return {
            connected: this.isConnected,
            lastConnectAttempt: new Date(this.lastConnectAttempt).toISOString(),
        };
    }

    publishMessage(topic: string, payload: any) {
        if (!this.client || !this.isConnected) {
            return { success: false, error: 'MQTT client not connected' };
        }

        try {
            // Convert payload to string if it's an object
            const message = typeof payload === 'object' 
                ? JSON.stringify(payload) 
                : String(payload);
            
            this.client.publish(topic, message);
            this.logger.log(`Published to ${topic}: ${message}`);
            return { success: true };
        } catch (error) {
            this.logger.error(`Error publishing to ${topic}: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    private connectToMqtt() {
        const url = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
        const options: mqtt.IClientOptions = {
            clientId: `nest-mqtt-client-${Math.random().toString(16).slice(2, 8)}`,
            username: process.env.MQTT_USERNAME,
            password: process.env.MQTT_PASSWORD,
            reconnectPeriod: 5000, // Reconnect every 5 seconds
        };

        this.logger.log(`Connecting to MQTT broker at ${url}`);
        this.lastConnectAttempt = Date.now();
        
        this.client = mqtt.connect(url, options);

        this.client.on('connect', () => {
            this.isConnected = true;
            this.logger.log('Connected to MQTT broker');
            
            // Subscribe to car topics
            this.client.subscribe('car/#', { qos: 0 }, (err) => {
                if (err) {
                    this.logger.error(`Error subscribing to topics: ${err.message}`);
                } else {
                    this.logger.log('Subscribed to car/# topics');
                }
            });

            // Subscribe to world-drive topic for location updates
            const worldDriveTopic = process.env.WORLD_DRIVE_MQTT_TOPIC;
            if (worldDriveTopic) {
                this.client.subscribe(worldDriveTopic, { qos: 0 }, (err) => {
                    if (err) {
                        this.logger.error(`Error subscribing to world-drive topic: ${err.message}`);
                    } else {
                        this.logger.log(`Subscribed to world-drive topic: ${worldDriveTopic}`);
                    }
                });
            }
        });

        this.client.on('message', (topic, payload) => {
            const message = payload.toString();
            this.isDebugMode() && this.logger.debug(`Received MQTT on ${topic}: ${message}`);
            
            try {
                // Parse payload if it's JSON
                let parsedPayload;
                try {
                    parsedPayload = JSON.parse(message);
                } catch (e) {
                    // If not JSON, try to convert to boolean
                    if (message === 'true' || message === 'false') {
                        parsedPayload = message === 'true';
                    } else {
                        parsedPayload = message;
                    }
                }
                
                // Handle world-drive location topic
                const worldDriveTopic = process.env.WORLD_DRIVE_MQTT_TOPIC;
                if (worldDriveTopic && topic === worldDriveTopic) {
                    // Assume payload: { latitude: number, longitude: number }
                    let coordinate;
                    try {
                        coordinate = JSON.parse(message);
                    } catch (e) {
                        this.logger.warn('Invalid JSON for location:', message);
                        return;
                    }
                    // Set location for all known cars
                    const allCarIds = Array.from(this.carStatsService['carStates'].keys());
                    if (allCarIds.length === 0) {
                        this.logger.warn('No cars found to update location');
                    }
                    allCarIds.forEach(carId => {
                        this.carStatsService.updateCarLocation(carId, coordinate);
                    });
                    return;
                }

                // Process message based on topic pattern car/{carId}/...
                if (topic.startsWith('car/')) {
                    const parts = topic.split('/');
                    
                    if (parts.length >= 2) {
                        const carId = parts[1];
                        
                        if (parts.length === 2) {
                            // Handle case where topic is just 'car/{carId}'
                            this.carStatsService.updateCarStats(carId, parsedPayload);
                        } else if (parts.length >= 3) {
                            if (parts[2] === 'stats') {
                                // Handle car/{carId}/stats
                                this.carStatsService.updateCarStats(carId, parsedPayload);
                            } else {
                                // Handle car/{carId}/{subtopic}
                                const subtopic = parts.slice(2).join('/');
                                this.carStatsService.handleCarEvent(carId, subtopic, parsedPayload);
                            }
                        }
                    }
                }
            } catch (error) {
                this.logger.error(`Error processing MQTT message: ${error.message}`);
            }
        });

        this.client.on('error', (error) => {
            this.logger.error(`MQTT client error: ${error.message}`);
        });

        this.client.on('disconnect', () => {
            this.isConnected = false;
            this.logger.warn('Disconnected from MQTT broker');
        });

        this.client.on('reconnect', () => {
            this.lastConnectAttempt = Date.now();
            this.isDebugMode() && this.logger.debug('Reconnecting to MQTT broker');
        });
    }

    private isDebugMode(): boolean {
        return process.env.LOG_LEVEL === 'debug' || process.env.LOG_LEVEL === 'verbose';
    }
}
