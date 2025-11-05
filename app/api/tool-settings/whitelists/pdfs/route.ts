import { NextRequest, NextResponse } from 'next/server';

// Shared state with main tool-settings route
// In production, this would be a database
let pdfWhitelist = [
  {
    id: 1,
    pdf_url:
      'https://www.epa.gov/sites/default/files/2017-09/documents/gpp-guidelines-for-making-solar-claims.pdf',
    description: 'EPA Guidelines for Making Solar Claims - Compliance',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    pdf_url:
      'https://www.epa.gov/sites/default/files/2019-08/documents/solar_cells_fact_sheet_p100il8r.pdf',
    description: 'EPA Solar Cells Fact Sheet - Technical specifications',
    created_at: new Date().toISOString(),
  },
];

let nextId = 3;

// Helper function to check authorization
function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  return true;
}

// POST /api/tool-settings/whitelists/pdfs
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Missing or invalid authorization' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { pdf_url, description } = body;

    if (!pdf_url) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'PDF URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(pdf_url);
    } catch {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const newPdf = {
      id: nextId++,
      pdf_url,
      description: description || null,
      created_at: new Date().toISOString(),
    };

    pdfWhitelist.push(newPdf);

    return NextResponse.json(newPdf, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Invalid request body' },
      { status: 400 }
    );
  }
}
