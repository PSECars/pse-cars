'use client'
import {GoogleMap, LoadScript, Marker} from "@react-google-maps/api"
import {FC, useState} from "react";
import {Coordinate} from "@/app/world-drive/service/currentPositionApiService";

export interface GoogleMapsComponentProps {
    position: { lat: number, lng: number }
}

const GoogleMapsComponent: FC<GoogleMapsComponentProps> = ({position}) => {
    const [center, setCenter] = useState<Coordinate>(position)

    return (
        <>
            <span className="absolute right-5 bottom-5 z-50">
                <button className="rounded-md cursor-pointer bg-surface-secondary p-2" onClick={() => setCenter(position)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
                      <line x1="12" y1="2" x2="12" y2="6" stroke="white" strokeWidth="2"/>
                      <line x1="12" y1="18" x2="12" y2="22" stroke="white" strokeWidth="2"/>
                      <line x1="2" y1="12" x2="6" y2="12" stroke="white" strokeWidth="2"/>
                      <line x1="18" y1="12" x2="22" y2="12" stroke="white" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="2" fill="white" />
                    </svg>
                </button>
            </span>
            <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
                <GoogleMap mapContainerStyle={{width: '100%', height: '885px'}}
                           options={{disableDefaultUI: true, mapTypeId: 'hybrid'}}
                           center={center} zoom={8}>
                    <Marker position={position}/>
                </GoogleMap>
            </LoadScript>
        </>
    )
}

export default GoogleMapsComponent
