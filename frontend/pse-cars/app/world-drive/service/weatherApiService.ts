import {Coordinate} from "@/app/world-drive/service/currentPositionApiService";

export interface WeatherData {
    degreesCelsius: number
    weatherDescription: string
    cityName: string
}

export class WeatherApiService {
    static async getWeatherAt(position: Coordinate): Promise<WeatherData> {
        const response = await fetch(`/api/world-drive/weather?lat=${position.latitude}&lng=${position.longitude}`);
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        return response.json();
    }
}
