import React, {FC, useEffect, useRef, useState} from 'react';
import {Coordinate} from "@/app/world-drive/service/currentPositionApiService";
import {WeatherApiService, WeatherData} from "@/app/world-drive/service/weatherApiService";

export interface WeatherComponentProps {
    position: Coordinate
}

const WeatherComponent: FC<WeatherComponentProps> = ({position}) => {
    const [weather, setWeather] = useState<WeatherData>()
    const errorStreak = useRef<number>(0)

    useEffect(() => {
        WeatherApiService.getWeatherAtCurrentPosition().then(async r => {
            setWeather(r)
            errorStreak.current = 0
        }).catch(() => {
            errorStreak.current = errorStreak.current + 1
        })
    }, [position]);

    return (<>
        {weather && (<div
            className="absolute top-25 right-5 z-50 bg-surface-secondary text-font-primary rounded-md p-2 px-4">
            <div className="flex flex-row gap-4">
                {errorStreak.current >= 10
                    ? (
                        <div className="text-sm text-red-500">Error: Unable to fetch weather
                            data</div>
                    )
                    : (<>
                        {weather.weatherDescription.toLowerCase().includes('rain')
                        || weather.weatherDescription.toLowerCase().includes('cloud')
                        || weather.weatherDescription.toLowerCase().includes('shower')
                            ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                   strokeWidth="1.5"
                                   stroke="currentColor" className="size-12">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z"/>
                            </svg>
                            : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                   strokeWidth="1.5"
                                   stroke="currentColor" className="size-12">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/>
                            </svg>
                        }
                        <div className="flex flex-col justify-start">
                            <div className="text-lg">{weather.cityName}</div>
                            <div className="text-sm">{weather.degreesCelsius}&nbsp;&deg;C</div>
                        </div>
                    </>)}
            </div>
        </div>)}
    </>);
};

export default WeatherComponent;