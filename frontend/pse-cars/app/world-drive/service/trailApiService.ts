import {Coordinate} from "@/app/world-drive/service/currentPositionApiService";

export class TrailApiService {
    static async getTrail(since: number): Promise<Coordinate[]> {
        const response = await fetch(`/api/world-drive/coordinates/trail?since=${since}`);
        if (!response.ok) {
            throw new Error('Failed to fetch trail data');
        }
        return response.json();
    }
}
