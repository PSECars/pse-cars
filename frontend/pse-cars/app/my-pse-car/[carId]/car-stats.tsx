'use client'

import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import Image from 'next/image'
import CarView from '@/app/assets/car-view.webp'
import { IconExternalLink } from '@tabler/icons-react'

interface CarStatsProps {
    carId: string;
}

interface Stats {
    range: number
    battery: number
    temperature: number
    latitude?: number
    longitude?: number
    lock?: boolean
    lights?: boolean
    climate?: boolean
    heating?: boolean
    cityName?: string
    [key: string]: any
}

let socket: Socket

export default function CarStats({ carId }: CarStatsProps) {
    const [stats, setStats] = useState<Stats>({
        range: 0,
        battery: 0,
        temperature: 0,
    })
    const [city, setCity] = useState<string | null>(null)
    const [isLoadingCity, setIsLoadingCity] = useState(false)

    useEffect(() => {
        if (!socket) {
            socket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string)
        }
        socket.emit('subscribeToCar', carId);
        fetchInitialData();
        const carSpecificTopic = `car/${carId}/stats`;
        socket.on(carSpecificTopic, (data: Stats) => {
            setStats(data);
        });
        return () => {
            socket.emit('unsubscribeFromCar', carId);
            socket.off(carSpecificTopic);
        }
    }, [carId])

    useEffect(() => {
        // Fetch city name if coordinates change
        if (
            stats.latitude !== undefined &&
            stats.longitude !== undefined &&
            (city === null ||
                stats.latitude.toFixed(3) + stats.longitude.toFixed(3) !== city)
        ) {
            setIsLoadingCity(true)
            fetchCityName(stats.latitude, stats.longitude)
                .then(cityName => {
                    setCity(cityName ? cityName : null)
                    setIsLoadingCity(false)
                })
                .catch(() => setIsLoadingCity(false))
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stats.latitude, stats.longitude])

    const fetchInitialData = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_IOT_URL || 'http://localhost:3002';
            const response = await fetch(`${apiUrl}/car/${carId}/stats`);
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching initial car stats:', error);
        }
    };

    // Use OpenStreetMap Nominatim API for reverse geocoding
    async function fetchCityName(lat?: number, lng?: number): Promise<string | null> {
        if (lat === undefined || lng === undefined) return null;
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
            );
            if (!res.ok) return null;
            const data = await res.json();
            // Try to get city, town, or village
            return (
                data.address.city ||
                data.address.town ||
                data.address.village ||
                data.address.hamlet ||
                data.address.county ||
                null
            );
        } catch {
            return null;
        }
    }

    return (
        <div className="flex flex-col items-center justify-center w-full z-10 m-16 gap-8 rounded-3xl border-1 border-outline-secondary p-10">
            <Image
                src={CarView}
                alt="PSE Cars Hero Image"
                className="object-cover w-full h-auto max-w-200"
            />
            <div className="flex flex-row justify-center w-full px-8 py-4 items-center gap-16 flex-wrap">
                <div className="flex flex-col items-center gap-2">
                    <h1 className="text-3xl text-font-primary font-medium">
                        {stats.range}{' '}
                        <span className="text-2xl">km</span>
                    </h1>
                    <h4 className="text-base text-font-primary font-normal">
                        Range
                    </h4>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <h1 className="text-3xl text-font-primary font-medium">
                        {stats.battery}{' '}
                        <span className="text-2xl">%</span>
                    </h1>
                    <h4 className="text-base text-font-primary font-normal">
                        Battery
                    </h4>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <h1 className="text-3xl text-font-primary font-medium">
                        {stats.temperature}{' '}
                        <span className="text-2xl">°C</span>
                    </h1>
                    <h4 className="text-base text-font-primary font-normal">
                        Temperature
                    </h4>
                </div>
                {/* Show location if available */}
                {stats.latitude !== undefined && stats.longitude !== undefined && (
                    <div className="flex flex-col items-center gap-2">
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${stats.latitude},${stats.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2"
                            title="Show on Google Maps"
                        >
                            <span className="text-xl font-medium">
                                {isLoadingCity
                                    ? "Loading location..."
                                    : city
                                        ? city
                                        : "Unknown location"}
                            </span>
                        </a>
                        <h4 className="text-base text-font-primary font-normal">
                            Location
                        </h4>
                    </div>
                )}
            </div>
        </div>
    )
}
