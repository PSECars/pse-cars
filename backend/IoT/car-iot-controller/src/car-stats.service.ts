import { Injectable, Logger } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';

export interface CarState {
    battery: number;
    range: number;
    temperature: number;
    lock: boolean;
    lights: boolean;
    climate: boolean;
    heating: boolean;
    latitude?: number;
    longitude?: number;
    [key: string]: any;
}

@Injectable()
export class CarStatsService {
    private readonly logger = new Logger(CarStatsService.name);
    private carStates = new Map<string, CarState>(); 
    private carEmitters = new Map<string, NodeJS.Timeout>();
    private lastEmitTime = 0;

    constructor(private readonly gateway: WebsocketGateway) {
        // Inject self into gateway for callback
        this.gateway.setCarStatsService(this);
    }

    getHealth() {
        return {
            status: 'UP',
            lastEmitTime: new Date(this.lastEmitTime).toISOString(),
            carCount: this.carStates.size,
            cars: Array.from(this.carStates.keys())
        };
    }

    getCarStats(carId: string): CarState {
        return this.getOrCreateCarState(carId);
    }

    // Start emitting stats for a specific car if not already started
    ensureEmittingForCar(carId: string) {
        if (this.carEmitters.has(carId)) return;
        this.carEmitters.set(carId, setInterval(() => {
            this.updateCarMockData(carId);
            const stats = this.prepareCarStats(carId);
            this.lastEmitTime = Date.now();
            this.isDebugMode() && this.logger.debug(`Emitting stats for car ${carId}: ${JSON.stringify(stats)}`);
            this.gateway.emitCarStats(carId, stats);
        }, 1000));
        this.logger.log(`Started emitting stats for car ${carId}`);
    }

    private updateCarMockData(carId: string) {
        const state = this.getOrCreateCarState(carId);
        
        // Drain battery & range
        state.battery -= Math.random();
        state.range = state.battery * 500 / 100; // Assuming 500km range at 100% battery
            // Reset when low
        if (state.battery <= 5 || state.range <= 10) {
            state.battery = 100;
            state.range = 300;
        }
        // Fluctuate temperature ±0.5°C
        state.temperature += (Math.random() - 0.5);
    }

    // Add or update car location
    updateCarLocation(carId: string, coordinate: { latitude: number; longitude: number }) {
        const state = this.getOrCreateCarState(carId);
        state.latitude = coordinate.latitude;
        state.longitude = coordinate.longitude;
        this.logger.log(`Updated location for car ${carId}: ${coordinate.latitude}, ${coordinate.longitude}`);
        // Emit updated stats to clients
        const stats = this.prepareCarStats(carId);
        this.gateway.emitCarStats(carId, stats);
    }

    private prepareCarStats(carId: string): CarState {
        const state = this.getOrCreateCarState(carId);
        return {
            ...state,
            battery: Math.round(state.battery),
            range: Math.round(state.range),
            temperature: Math.round(state.temperature * 10) / 10,
            latitude: state.latitude,
            longitude: state.longitude,
        };
    }

    // Get or create a car state object
    private getOrCreateCarState(carId: string): CarState {
        if (!this.carStates.has(carId)) {
            this.carStates.set(carId, {
                battery: 100,
                range: 300,
                temperature: 20,
                lock: false,
                lights: false,
                climate: false,
                heating: false
            });
            this.logger.log(`Created new state for car ${carId}`);
        }
        // Non-null assertion operator (!) to tell TypeScript this won't be undefined
        // We know it won't be undefined because we just checked and created it if needed
        return this.carStates.get(carId)!;
    }

    // Methods for handling MQTT data
    updateCarStats(carId: string, data: any) {
        this.logger.log(`Received MQTT data for car ${carId}: ${JSON.stringify(data)}`);
        const state = this.getOrCreateCarState(carId);
        let stateChanged = false;
        
        // Update carState for non-mock data fields
        Object.keys(data).forEach((key) => {
            if (!['battery', 'range', 'temperature'].includes(key) || 
                (data[key] !== undefined && data[key] !== null)) {
                if (state[key] !== data[key]) {
                    state[key] = data[key];
                    stateChanged = true;
                }
            }
        });
        
        // If any control state was changed, emit an update
        if (stateChanged) {
            this.logger.log(`State changed for car ${carId}, emitting update`);
            const stats = this.prepareCarStats(carId);
            this.gateway.emitCarStats(carId, stats);
        }
    }

    handleCarEvent(carId: string, subtopic: string, payload: any) {
        this.logger.log(`Handling car event for ${carId}/${subtopic}: ${JSON.stringify(payload)}`);
        
        const state = this.getOrCreateCarState(carId);
        // Store state in our carState object
        state[subtopic] = payload;
        
        // Emit immediate update for UI feedback
        const stats = this.prepareCarStats(carId);
        this.gateway.emitCarStats(carId, stats);
    }

    private isDebugMode(): boolean {
        return process.env.LOG_LEVEL === 'debug' || process.env.LOG_LEVEL === 'verbose';
    }
}
