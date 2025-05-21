import { NextResponse } from 'next/server';

export async function GET() {
    const backendHost = process.env.NEXT_PUBLIC_WORLD_DRIVE_HOST;
    const url = `http://${backendHost}/weather?position=current`;
    const backendResponse = await fetch(url);
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
}

