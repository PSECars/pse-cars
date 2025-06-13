'use server'
import React from 'react'
import WorldDriveComponent from "@/app/world-drive/components/WorldDriveComponent"

export default async function WorldDrive() {
    async function getMapboxToken() {
        'use server'
        return process.env.NEXT_PUBLIC_MAPBOX_TOKEN!
    }

    return (
        <>
            <div className="mt-20"></div>
            <WorldDriveComponent mapboxToken={await getMapboxToken()}/>
        </>
    )
}

