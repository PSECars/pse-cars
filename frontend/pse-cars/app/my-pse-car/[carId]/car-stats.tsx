'use client'

import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import Image from 'next/image'
import CarView from '@/app/assets/car-view.webp'

interface CarStatsProps {
    carId: string;
}

interface Stats {
    range: number
    battery: number
    temperature: number
    lock?: boolean
    lights?: boolean
    climate?: boolean
    heating?: boolean
    [key: string]: any
}

let socket: Socket

export default function CarStats({ carId }: CarStatsProps) {
    const [stats, setStats] = useState<Stats>({
        range: 0,
        battery: 0,
        temperature: 0,
    })

    useEffect(() => {
        if (!socket) {
            socket = io(process.env.NEXT_PUBLIC_WS_URL as string)
        }
        
        // Subscribe to this specific car
        socket.emit('subscribeToCar', carId);
        
        // Listen to the car-specific stats topic
        const carSpecificTopic = `car/${carId}/stats`;
        socket.on(carSpecificTopic, (data: Stats) => {
            console.log(`Received stats for car ${carId}:`, data);
            setStats(data);
        });
        
        // Also keep the legacy listener for backward compatibility
        socket.on('carStats', (data: Stats) => {
            if (data.carId === carId) {
                console.log(`Received legacy stats for car ${carId}:`, data);
                setStats(data);
            }
        });
        
        // Initial data fetch
        fetchInitialData();
        
        return () => {
            socket.emit('unsubscribeFromCar', carId);
            socket.off(carSpecificTopic);
            socket.off('carStats');
        }
    }, [carId])
    
    const fetchInitialData = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
            const response = await fetch(`${apiUrl}/car/${carId}/stats`);
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching initial car stats:', error);
        }
    };

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
            </div>
        </div>
    )
}
