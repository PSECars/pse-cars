"use client";

import CarStats from "@/app/my-pse-car/[carId]/car-stats";
import {IconFlame, IconLock, IconLockOpen, IconPropeller, IconSun} from "@tabler/icons-react";
import {
    setCarLock,
    setCarLights,
    setCarClimate,
    setCarHeating
} from "../../actions/mqtt";
import { useState, useEffect } from "react";
import { io, Socket } from 'socket.io-client';
import { useParams } from 'next/navigation';

interface CarState {
    lock?: boolean;
    lights?: boolean;
    climate?: boolean;
    heating?: boolean;
    latitude?: number;
    longitude?: number;
    [key: string]: any;
}

let socket: Socket;

export default function MyPseCarPage() {
    const params = useParams();
    const carId = params.carId as string;

    const [carState, setCarState] = useState<CarState>({
        lock: false,
        lights: false,
        climate: false,
        heating: false
    });

    const [pendingActions, setPendingActions] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!socket) {
            socket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string);
        }

        // Subscribe to this specific car
        socket.emit('subscribeToCar', carId, (response: any) => {
            console.log('Subscribed to car:', response);
        });

        socket.on(`car/${carId}/stats`, (data: any) => {
            const newState = { ...carState };

            // Update state with values from WebSocket
            if (data.lock !== undefined) newState.lock = data.lock;
            if (data.lights !== undefined) newState.lights = data.lights;
            if (data.climate !== undefined) newState.climate = data.climate;
            if (data.heating !== undefined) newState.heating = data.heating;
            if (data.latitude !== undefined) newState.latitude = data.latitude;
            if (data.longitude !== undefined) newState.longitude = data.longitude;

            setCarState(newState);

            // Clear pending actions when state is updated from server
            setPendingActions({});
        });

        return () => {
            socket.emit('unsubscribeFromCar', carId);
            socket.off(`car/${carId}/stats`);
        };
    }, [carId]);

    const handleAction = async (action: string) => {
        setPendingActions(prev => ({ ...prev, [action]: true }));
        const newValue = !carState[action];

        try {
            // Use dedicated server actions for each control
            if (action === 'lock') {
                await setCarLock(carId, newValue);
            } else if (action === 'lights') {
                await setCarLights(carId, newValue);
            } else if (action === 'climate') {
                await setCarClimate(carId, newValue);
            } else if (action === 'heating') {
                await setCarHeating(carId, newValue);
            } else {
                throw new Error('Unknown action');
            }
            setCarState(prev => ({ ...prev, [action]: newValue }));
        } catch (error) {
            console.error(`Error sending ${action} command:`, error);
        }
    };

    const getButtonClass = (action: string) => {
        const isActive = carState[action];
        const isPending = pendingActions[action];
        
        let baseClass = "flex flex-col items-center justify-center w-full gap-2 rounded-3xl border-1 p-8 transition-all duration-300";
        
        if (isPending) {
            return `${baseClass} border-outline-primary bg-surface-tertiary animate-pulse`;
        }
        
        if (isActive) {
            return `${baseClass} border-outline-primary bg-surface-tertiary`;
        }
        
        return `${baseClass} border-outline-secondary`;
    };

    return (
        <div className="overflow-x-hidden">
            <main className="flex flex-col items-center px-10 max-w-400 mx-auto bg-surface-primary mt-24">
                <CarStats carId={carId} />
                <section className="flex flex-col items-start w-full gap-8">
                    <h1 className="text-3xl text-font-primary font-medium">Control Panel</h1>
                    <div className="flex flex-row gap-8 w-full flex-wrap justify-between">

                        <div className="flex-1 min-w-30">
                            <button 
                                type="button" 
                                className={getButtonClass('heating')}
                                onClick={() => handleAction('heating')}
                                disabled={pendingActions['heating']}
                            >
                                <IconFlame className={`h-16 w-16 ${carState.heating ? 'text-red-500' : ''}`} />
                                <span className="text-lg text-font-primary font-normal">
                                    {pendingActions['heating'] 
                                        ? 'Updating...' 
                                        : `Heating ${carState.heating ? 'On' : 'Off'}`}
                                </span>
                            </button>
                        </div>

                        <div className="flex-1 min-w-30">
                            <button 
                                type="button" 
                                className={getButtonClass('lock')}
                                onClick={() => handleAction('lock')}
                                disabled={pendingActions['lock']}
                            >
                                {carState.lock 
                                    ? <IconLock className="h-16 w-16 text-blue-500" /> 
                                    : <IconLockOpen className="h-16 w-16" />}
                                <span className="text-lg text-font-primary font-normal">
                                    {pendingActions['lock'] 
                                        ? 'Updating...' 
                                        : `Car ${carState.lock ? 'Locked' : 'Unlocked'}`}
                                </span>
                            </button>
                        </div>

                        <div className="flex-1 min-w-30">
                            <button 
                                type="button" 
                                className={getButtonClass('lights')}
                                onClick={() => handleAction('lights')}
                                disabled={pendingActions['lights']}
                            >
                                <IconSun className={`h-16 w-16 ${carState.lights ? 'text-yellow-500' : ''}`} />
                                <span className="text-lg text-font-primary font-normal">
                                    {pendingActions['lights'] 
                                        ? 'Updating...' 
                                        : `Lights ${carState.lights ? 'On' : 'Off'}`}
                                </span>
                            </button>
                        </div>

                        <div className="flex-1 min-w-30">
                            <button 
                                type="button" 
                                className={getButtonClass('climate')}
                                onClick={() => handleAction('climate')}
                                disabled={pendingActions['climate']}
                            >
                                <IconPropeller className={`h-16 w-16 ${carState.climate ? 'text-blue-500' : ''}`} />
                                <span className="text-lg text-font-primary font-normal">
                                    {pendingActions['climate'] 
                                        ? 'Updating...' 
                                        : `Climate ${carState.climate ? 'On' : 'Off'}`}
                                </span>
                            </button>
                        </div>

                    </div>
                </section>
            </main>
        </div>
    );
}
