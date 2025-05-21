import * as turf from '@turf/turf'
import {Coordinate} from "../types/sharedTypes";

/**
 * Observer interface for classes that want to be notified of new GPS coordinates.
 */
export interface Subscriber {
    notify(coordinate: Coordinate): void
}

/**
 * Coordinate Service simulates the generation of GPS coordinates for our vehicle.
 */
export class CoordinateService {
    private static instance: CoordinateService

    private coordinatesMap: Map<number, Coordinate> = new Map()
    private currentCoordinate: Coordinate
    private directionInDegrees: number
    private subscribers: Subscriber[] = []

    constructor() {
        this.currentCoordinate = { lat: 48.8603192, lng: 9.1780495 }
        this.directionInDegrees = Math.random() * 360 // Random initial direction
        this.start()
    }

    /**
     * Start generating GPS coordinates at regular intervals.
     * @param intervalMs Interval in milliseconds.
     */
    private start(intervalMs: number = 5000): void {
        setInterval(() => {
            this.generateNextCoordinate()
        }, intervalMs)
    }

    /**
     * Generate the next GPS coordinate using turf.js.
     */
    private generateNextCoordinate(): void {
        const distanceInKm = 10
        const point = turf.point([this.currentCoordinate.lng, this.currentCoordinate.lat])
        const destination = turf.destination(point, distanceInKm, this.directionInDegrees, { units: 'kilometers' })

        const [newLongitude, newLatitude] = destination.geometry.coordinates

        this.directionInDegrees += (Math.random() - 0.5) * 36
        this.directionInDegrees = this.directionInDegrees <= -180
            ? 180 + (this.directionInDegrees % 180)
            : this.directionInDegrees > 180
                ? -180 + (this.directionInDegrees % 180)
                : this.directionInDegrees

        this.currentCoordinate = { lat: newLatitude, lng: newLongitude }
        this.coordinatesMap.set(Date.now(), this.currentCoordinate)

        this.notifySubscribers()
    }

    /**
     * Notify all subscribers of the new coordinate.
     */
    private notifySubscribers(): void {
        for (const subscriber of this.subscribers) {
            subscriber.notify(this.currentCoordinate)
        }
    }

    /**
     * Get our singleton instance
     */
    public static getInstance(): CoordinateService {
        if (!CoordinateService.instance) {
            CoordinateService.instance = new CoordinateService();
        }
        return CoordinateService.instance;
    }

    /**
     * Subscribe a new observer.
     * @param subscriber The observer to subscribe.
     */
    public subscribe(subscriber: Subscriber): void {
        this.subscribers.push(subscriber)
    }

    /**
     * Unsubscribe an observer.
     * @param subscriber The observer to unsubscribe.
     */
    public unsubscribe(subscriber: Subscriber): void {
        this.subscribers = this.subscribers.filter((sub) => sub !== subscriber)
    }

    /**
     * Get the coordinates of the current position
     */
    public getCurrentPosition() {
        return this.currentCoordinate
    }
}

export default CoordinateService.getInstance()
