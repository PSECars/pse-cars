'use client'
import {useEffect, useState} from "react"
import currentPositionApiService, {Coordinate} from "@/app/world-drive/service/currentPositionApiService"
import WeatherComponent from "@/app/world-drive/components/WeatherComponent";
import MapboxComponent from "@/app/world-drive/components/MapboxComponent";

interface WorldDriveComponentProps {
    mapboxToken: string
}

export default function WorldDriveComponent({mapboxToken}: WorldDriveComponentProps) {
    const [position, setPosition] = useState<Coordinate>({latitude: 48.8603192, longitude: 9.1780495})

    useEffect(() => {
        const handleCoordinate = (coordinate: Coordinate) => setPosition(coordinate)
        currentPositionApiService.subscribe(handleCoordinate)
        return () => currentPositionApiService.unsubscribe(handleCoordinate)
    }, [])

    return (
        <>
            <MapboxComponent position={position} mapboxToken={mapboxToken}/>
            <WeatherComponent position={position}/>
        </>
    )
}
