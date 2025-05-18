'use client'
import {GoogleMap, LoadScript, Marker} from "@react-google-maps/api";

const center = {
    lat: 37.7749,
    lng: -122.4194
}

export default function GoogleMapsComponentInternal() {
    return (
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <GoogleMap mapContainerStyle={{width: '100%', height: '885px'}}
                       options={{disableDefaultUI: true, mapTypeId: 'hybrid'}}
                       center={center} zoom={10}>
                <Marker position={center}/>
            </GoogleMap>
        </LoadScript>
    );
}
