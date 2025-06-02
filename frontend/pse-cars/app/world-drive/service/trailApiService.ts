import {Coordinate} from "@/app/world-drive/service/currentPositionApiService";

export class TrailApiService {
    static async getTrail(): Promise<Coordinate[]> {
        const response = await fetch('/api/world-drive/coordinates/trail');
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        return response.json();
    }
}
