import { NextRequest, NextResponse } from 'next/server';

// Shared state with main tool-settings route
// In production, this would be a database
let urlWhitelist = [
  {
    id: 1,
    url: 'https://luminaire.ukoreh.com/about',
    description: 'About Luminaire Solar company',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    url: 'https://luminaire.ukoreh.com/products',
    description: 'Luminaire Solar product catalog',
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    url: 'https://luminaire.ukoreh.com',
    description: 'Official Luminaire Solar website',
    created_at: new Date().toISOString(),
  },
];

let nextId = 4;

// Helper function to check authorization
function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  return true;
}

// POST /api/tool-settings/whitelists/urls
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Missing or invalid authorization' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { url, description } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const newUrl = {
      id: nextId++,
      url,
      description: description || null,
      created_at: new Date().toISOString(),
    };

    urlWhitelist.push(newUrl);

    return NextResponse.json(newUrl, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Invalid request body' },
      { status: 400 }
    );
  }
}
