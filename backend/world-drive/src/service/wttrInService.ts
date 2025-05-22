import {Coordinate} from "../types/Coordinate";
import {WeatherData} from "../types/WeatherData";

/**
 * Client service for the wttr.in API.
 */
class WttrInService {
    private static instance: WttrInService;

    private constructor() {}

    /**
     * Get our singleton instance
     */
    static getInstance(): WttrInService {
        if (!WttrInService.instance) {
            WttrInService.instance = new WttrInService();
        }
        return WttrInService.instance;
    }

    /**
     * Get the current weather at the given position.
     * @param coordinate of the position to get the weather to.
     */
    async getWeatherAt(coordinate: Coordinate): Promise<WeatherData> {
        const url = `https://wttr.in/${coordinate.latitude},${coordinate.longitude}?format=j1`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch weather data: ${response.statusText}`);
        }
        const json = await response.json();
        return {
            degreesCelsius: json?.current_condition?.[0]?.temp_C,
            weatherDescription: json?.current_condition?.[0]?.weatherDesc?.[0]?.value ?? 'n/a',
            cityName: json?.nearest_area?.[0]?.areaName?.[0]?.value ?? 'n/a'
        }
    }
}

export default WttrInService.getInstance();
