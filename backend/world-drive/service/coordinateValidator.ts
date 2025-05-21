import {Coordinate} from "../types/sharedTypes";

/**
 * Utility class for validating GPS coordinates.
 */
export default class CoordinateValidator {
    private static isValidLatitude(lat: any): boolean {
        return typeof lat === 'number' && isFinite(lat) && lat >= -90 && lat <= 90;
    }

    private static isValidLongitude(lon: any): boolean {
        return typeof lon === 'number' && isFinite(lon) && lon >= -180 && lon <= 180;
    }

    /**
     * Validate if the given coordinate is a valid GPS coordinate.
     * @param coordinate the coordinate to validate.
     */
    public static isValidCoordinate(coordinate: Coordinate): boolean {
        return this.isValidLatitude(coordinate.lat) && this.isValidLongitude(coordinate.lng);
    }
}

