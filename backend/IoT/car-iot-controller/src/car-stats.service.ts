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
    [key: string]: any;
}

@Injectable()
export class CarStatsService {
    private readonly logger = new Logger(CarStatsService.name);
    private carStates = new Map<string, CarState>(); 
    private emitterInterval: NodeJS.Timeout;
    private lastEmitTime = 0;

    constructor(private readonly gateway: WebsocketGateway) {
        this.startEmitting();
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

    private startEmitting() {
        this.emitterInterval = setInterval(() => {
            // Update and emit stats for all cars
            this.carStates.forEach((state, carId) => {
                this.updateCarMockData(carId);
                
                const stats = this.prepareCarStats(carId);
                
                this.lastEmitTime = Date.now();
                this.isDebugMode() && this.logger.debug(`Emitting stats for car ${carId}: ${JSON.stringify(stats)}`);
                this.gateway.emitCarStats(carId, stats);
            });
        }, 1000);
    }

    private updateCarMockData(carId: string) {
        const state = this.getOrCreateCarState(carId);
        
        // Drain battery & range
        state.battery -= Math.random();
        state.range -= Math.random() * 2;
        // Reset when low
        if (state.battery <= 5 || state.range <= 10) {
            state.battery = 100;
            state.range = 300;
        }
        // Fluctuate temperature ±0.5°C
        state.temperature += (Math.random() - 0.5);
    }

    private prepareCarStats(carId: string): CarState {
        const state = this.getOrCreateCarState(carId);
        return {
            ...state,
            battery: Math.round(state.battery),
            range: Math.round(state.range),
            temperature: Math.round(state.temperature * 10) / 10,
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
