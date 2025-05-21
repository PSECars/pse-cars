'use client'
import {useEffect, useState} from "react"
import currentPositionApiService, {Coordinate} from "@/app/world-drive/service/currentPositionApiService"
import GoogleMapsComponent from "@/app/world-drive/components/GoogleMapsComponent";
import WeatherComponent from "@/app/world-drive/components/WeatherComponent";

export default function WorldDriveComponent() {
    const [position, setPosition] = useState<Coordinate>({lat: 48.8603192, lng: 9.1780495})

    useEffect(() => {
        const handleCoordinate = (coordinate: Coordinate) => setPosition(coordinate)
        currentPositionApiService.subscribe(handleCoordinate)
        return () => currentPositionApiService.unsubscribe(handleCoordinate)
    }, [])

    return (
        <>
            <GoogleMapsComponent position={position}/>
            <WeatherComponent position={position}/>
        </>
    )
}
