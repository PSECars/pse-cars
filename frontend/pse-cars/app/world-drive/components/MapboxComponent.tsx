'use client'

import {FC, useEffect, useRef, useState} from 'react'
import Map, {AttributionControl, MapRef, Marker, Source, Layer} from "react-map-gl/mapbox"
import 'mapbox-gl/dist/mapbox-gl.css'
import {GeoJSON} from "geojson"
import {LayerProps} from "react-map-gl"
import {TrailApiService} from "@/app/world-drive/service/trailApiService"

export interface MapboxComponentProps {
    position: { lat: number, lng: number }
}

const MapboxComponent: FC<MapboxComponentProps> = ({position}) => {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    const mapRef = useRef<MapRef>(null)
    const [trail, setTrail] = useState<number[][]>([])

    const handleCenter = () => {
        mapRef.current?.flyTo({center: [position.lng, position.lat], zoom: 8})
    }

    useEffect(() => {
        TrailApiService.getTrail().then(r => setTrail(r.map(c => [c.lng, c.lat])))
    }, [])

    useEffect(() => {
        setTrail(prevTrail => [...prevTrail, [position.lng, position.lat]])
    }, [position])

    const trailGeoJson: GeoJSON = {
        properties: {},
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: trail,
        }
    }
    const trailLayer: LayerProps = {
        id: 'trail',
        type: 'line',
        source: 'trail',
        layout: {
            'line-cap': 'round',
            'line-join': 'round',
        },
        paint: {
            'line-width': 6,
            'line-gradient': [
                'interpolate', ['linear'], ['line-progress'],
                0, 'rgba(0,0,0,0.2)',
                1, 'rgb(255,0,0)'
            ]
        },
    }

    return (
        <div className="relative w-full h-[calc(100vh-5rem)] overflow-hidden">
            <span className="absolute right-5 bottom-5 z-50">
                <button className="rounded-md cursor-pointer bg-surface-secondary p-2" onClick={handleCenter}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
                      <line x1="12" y1="2" x2="12" y2="6" stroke="white" strokeWidth="2"/>
                      <line x1="12" y1="18" x2="12" y2="22" stroke="white" strokeWidth="2"/>
                      <line x1="2" y1="12" x2="6" y2="12" stroke="white" strokeWidth="2"/>
                      <line x1="18" y1="12" x2="22" y2="12" stroke="white" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="2" fill="white"/>
                    </svg>
                </button>
            </span>
            <Map ref={mapRef}
                 mapboxAccessToken={mapboxToken}
                 mapStyle="mapbox://styles/mapbox/streets-v12"
                 initialViewState={{latitude: position.lat, longitude: position.lng, zoom: 8}}
                 maxZoom={20}
                 minZoom={3}
                 attributionControl={false}>
                <Marker latitude={position.lat} longitude={position.lng} anchor="center" color="red"/>
                <Source id="trail" type="geojson" data={trailGeoJson} lineMetrics={true}>
                    {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                    {/*@ts-ignore*/}
                    <Layer {...trailLayer} />
                </Source>
                <AttributionControl compact={true} position="top-left"
                                    style={{position: 'absolute', bottom: '0', right: '0', color: 'black'}}/>
            </Map>
        </div>
    )
}

export default MapboxComponent
