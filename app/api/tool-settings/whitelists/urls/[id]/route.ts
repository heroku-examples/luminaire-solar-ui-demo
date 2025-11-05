import { NextRequest, NextResponse } from 'next/server';

// Shared state (in production, this would be a database)
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

// Helper function to check authorization
function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  return true;
}

// DELETE /api/tool-settings/whitelists/urls/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Missing or invalid authorization' },
      { status: 401 }
    );
  }

  const { id: idString } = await params;
  const id = parseInt(idString);
  const index = urlWhitelist.findIndex((item) => item.id === id);

  if (index === -1) {
    return NextResponse.json(
      { error: 'Not Found', message: 'URL not found' },
      { status: 404 }
    );
  }

  urlWhitelist.splice(index, 1);

  return NextResponse.json({
    success: true,
    message: 'URL removed from whitelist',
  });
}
