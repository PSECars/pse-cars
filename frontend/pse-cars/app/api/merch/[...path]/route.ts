// app/api/merch/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:8083';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params, 'GET');
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params, 'POST');
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params, 'PUT');
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params, 'DELETE');
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    console.log(`[API Route] Starting ${method} request`);
    console.log(`[API Route] Params:`, params);
    
    // Build URL
    const path = params.path?.join('/') || '';
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${BACKEND_URL}/merch/api/${path}${searchParams ? `?${searchParams}` : ''}`;

    console.log(`[API Route] Target URL: ${url}`);

    // Get body for POST/PUT
    let body;
    if (method === 'POST' || method === 'PUT') {
      try {
        body = await request.text();
        console.log(`[API Route] Request body: ${body}`);
      } catch (e) {
        console.log(`[API Route] No body or error reading body:`, e);
      }
    }

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Forward cookies
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
      console.log(`[API Route] Forwarding cookies`);
    }

    console.log(`[API Route] Making fetch request to backend...`);

    // Make request to backend
    const backendResponse = await fetch(url, {
      method,
      headers,
      body: body || undefined,
    });

    console.log(`[API Route] Backend response status: ${backendResponse.status}`);

    // Get response data
    const responseText = await backendResponse.text();
    console.log(`[API Route] Backend response text length: ${responseText.length}`);

    // Create response
    const response = new NextResponse(responseText, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Handle cookies
    try {
      const setCookieHeaders = backendResponse.headers.getSetCookie();
      if (setCookieHeaders && setCookieHeaders.length > 0) {
        setCookieHeaders.forEach(cookie => {
          response.headers.append('Set-Cookie', cookie);
        });
        console.log(`[API Route] Set ${setCookieHeaders.length} cookies`);
      }
    } catch (e) {
      console.log(`[API Route] Cookie handling error (non-critical):`, e);
    }

    console.log(`[API Route] Request completed successfully`);
    return response;

  } catch (error) {
    console.error(`[API Route] Error in ${method} request:`, error);
    console.error(`[API Route] Error details:`, {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });

    return NextResponse.json(
      { 
        success: false, 
        message: 'Backend service unavailable',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 502 }
    );
  }
}