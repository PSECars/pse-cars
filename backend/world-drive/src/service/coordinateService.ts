import * as turf from '@turf/turf'
import {Coordinate} from "../types/Coordinate";

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
        this.currentCoordinate = { latitude: 48.8603192, longitude: 9.1780495 }
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
        const point = turf.point([this.currentCoordinate.longitude, this.currentCoordinate.latitude])
        const destination = turf.destination(point, distanceInKm, this.directionInDegrees, { units: 'kilometers' })

        const [newLongitude, newLatitude] = destination.geometry.coordinates

        this.directionInDegrees += (Math.random() - 0.5) * 72
        this.directionInDegrees = this.directionInDegrees <= -180
            ? 180 + (this.directionInDegrees % 180)
            : this.directionInDegrees > 180
                ? -180 + (this.directionInDegrees % 180)
                : this.directionInDegrees

        this.currentCoordinate = { latitude: newLatitude, longitude: newLongitude }
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

    /**
     * Get the previous coordinates in form
     */
    public getEarlierPositions() {
        return Array.from(this.coordinatesMap.values())
    }
}

export default CoordinateService.getInstance()
