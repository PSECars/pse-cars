import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: { origin: '*' },
})
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(WebsocketGateway.name);
    private carSubscriptions = new Map<string, Set<string>>();
    
    @WebSocketServer()
    server: Server;

    afterInit(server: Server) {
        this.logger.log('WebSocket Gateway initialized');
    }
    
    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    
    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
        
        // Clean up subscriptions when client disconnects
        this.carSubscriptions.forEach((clients, carId) => {
            if (clients.has(client.id)) {
                clients.delete(client.id);
                this.logger.log(`Client ${client.id} unsubscribed from car ${carId}`);
            }
        });
    }

    @SubscribeMessage('subscribeToCar')
    handleSubscribeToCar(client: Socket, carId: string) {
        // Initialize the set if this is the first subscriber for this car
        if (!this.carSubscriptions.has(carId)) {
            this.carSubscriptions.set(carId, new Set());
        }
        
        // Add this client to the subscribers for this car
        // The set is guaranteed to exist now
        const subscribers = this.carSubscriptions.get(carId);
        if (subscribers) {
            subscribers.add(client.id);
            this.logger.log(`Client ${client.id} subscribed to car ${carId}`);
        }
        
        return { success: true, carId };
    }

    @SubscribeMessage('unsubscribeFromCar')
    handleUnsubscribeFromCar(client: Socket, carId: string) {
        const subscribers = this.carSubscriptions.get(carId);
        if (subscribers) {
            subscribers.delete(client.id);
            this.logger.log(`Client ${client.id} unsubscribed from car ${carId}`);
        }
        
        return { success: true, carId };
    }

    // Legacy method for backward compatibility
    emitStats(stats: { battery: number; range: number; temperature: number; [key: string]: any }) {
        this.server.emit('carStats', stats);
    }

    // New method for car-specific stats
    emitCarStats(carId: string, stats: { battery: number; range: number; temperature: number; [key: string]: any }) {
        // Get subscribers for this car
        const subscribers = this.carSubscriptions.get(carId);
        const subscriberCount = subscribers?.size || 0;
        
        if (this.isDebugMode()) {
            this.logger.debug(`Emitting stats for car ${carId} to ${subscriberCount} subscribers`);
            this.logger.debug(`Stats: ${JSON.stringify(stats)}`);
        }
        
        // Emit to car-specific topic (only to clients who subscribed to this car)
        if (subscribers && subscribers.size > 0) {
            // For each subscribed client, emit the event directly to them
            subscribers.forEach(clientId => {
                const clientSocket = this.server.sockets.sockets.get(clientId);
                if (clientSocket) {
                    clientSocket.emit(`car/${carId}/stats`, stats);
                    // Also emit to legacy channel for backward compatibility
                    clientSocket.emit('carStats', { ...stats, carId });
                }
            });
        } else {
            // No subscribers, but still broadcast for anyone who might be listening
            this.server.emit(`car/${carId}/stats`, stats);
            this.server.emit('carStats', { ...stats, carId });
        }
    }
    
    private isDebugMode(): boolean {
        return process.env.LOG_LEVEL === 'debug' || process.env.LOG_LEVEL === 'verbose';
    }
}
