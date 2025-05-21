/**
 * GPS Coordinate type representing a specific point on a two-dimensional map by latitude and longitude.
 */
export interface Coordinate {
    lat: number
    lng: number
}

export interface WeatherData {
    degreesCelsius: number
    weatherDescription: string
    cityName: string
}

