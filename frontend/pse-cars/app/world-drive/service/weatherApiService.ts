export interface WeatherData {
    degreesCelsius: number
    weatherDescription: string
    cityName: string
}

export class WeatherApiService {
    static async getWeatherAtCurrentPosition(): Promise<WeatherData> {
        const response = await fetch('/api/world-drive/weather?position=current');
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        return response.json();
    }
}
