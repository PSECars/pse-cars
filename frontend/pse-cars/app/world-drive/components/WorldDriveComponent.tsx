'use client'
import {useEffect, useState} from "react"
import currentPositionApiService, {Coordinate} from "@/app/world-drive/service/currentPositionApiService"
import WeatherComponent from "@/app/world-drive/components/WeatherComponent";
import MapboxComponent from "@/app/world-drive/components/MapboxComponent";

export default function WorldDriveComponent() {
    const [position, setPosition] = useState<Coordinate>({lat: 48.8603192, lng: 9.1780495})

    useEffect(() => {
        const handleCoordinate = (coordinate: Coordinate) => setPosition(coordinate)
        currentPositionApiService.subscribe(handleCoordinate)
        return () => currentPositionApiService.unsubscribe(handleCoordinate)
    }, [])

    return (
        <>
            <MapboxComponent position={position}/>
            <WeatherComponent position={position}/>
        </>
    )
}
