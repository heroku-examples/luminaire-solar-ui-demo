import { NextRequest, NextResponse } from 'next/server';

// Generic API proxy for all /api/* routes
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'DELETE');
}

async function handleRequest(
  request: NextRequest,
  { path }: { path: string[] },
  method: string
) {
  try {
    const apiUrl = process.env.API_URL || 'http://0.0.0.0:3001';
    const apiPath = path.join('/');
    const url = new URL(request.url);
    const queryString = url.search;

    // Forward the authorization header
    const headers: Record<string, string> = {};
    const authorization = request.headers.get('authorization');
    if (authorization) {
      headers['Authorization'] = authorization;
    }

    // Forward content-type for POST/PUT requests
    const contentType = request.headers.get('content-type');
    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    // Prepare fetch options
    const fetchOptions: {
      method: string;
      headers: Record<string, string>;
      body?: string;
    } = {
      method,
      headers,
    };

    // Add body for POST/PUT requests
    if (method === 'POST' || method === 'PUT') {
      try {
        const body = await request.text();
        if (body) {
          fetchOptions.body = body;
        }
      } catch (_e) {
        // No body
      }
    }

    // Make the request to the backend API
    const response = await fetch(
      `${apiUrl}/api/${apiPath}${queryString}`,
      fetchOptions
    );

    // Check if response is a stream (for chat completions and forecast analysis)
    const responseContentType = response.headers.get('content-type') || '';

    // For chat endpoint and forecast analysis, always stream the response
    if (
      apiPath === 'chat' ||
      (apiPath.includes('forecast') && apiPath.includes('analysis')) ||
      responseContentType.includes('text/event-stream') ||
      responseContentType.includes('text/plain') ||
      responseContentType.includes('application/x-ndjson')
    ) {
      // Stream the response directly without consuming it
      return new NextResponse(response.body, {
        status: response.status,
        headers: {
          'Content-Type': responseContentType,
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    // Get response text for non-streaming responses
    const responseText = await response.text();

    // Try to parse as JSON, otherwise return as text
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json({ error: 'API request failed' }, { status: 500 });
  }
}
