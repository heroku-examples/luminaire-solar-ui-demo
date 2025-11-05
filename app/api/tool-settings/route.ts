import { NextRequest, NextResponse } from 'next/server';

// Mock data for demo purposes
// In production, this would come from a database
let toolSettings = {
  tools: {
    postgres_query: true,
    postgres_schema: true,
    html_to_markdown: true,
    pdf_to_markdown: true,
    code_exec_python: true,
  },
  cache: {
    schema_cache: true,
  },
  whitelists: {
    urls: [
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
    ],
    pdfs: [
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
    ],
  },
  updated_at: new Date().toISOString(),
};

// Helper function to check authorization
function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  return true;
}

// GET /api/tool-settings
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Missing or invalid authorization' },
      { status: 401 }
    );
  }

  return NextResponse.json(toolSettings);
}

// PUT /api/tool-settings
export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Missing or invalid authorization' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Update tools
    if ('postgres_query' in body)
      toolSettings.tools.postgres_query = body.postgres_query;
    if ('postgres_schema' in body)
      toolSettings.tools.postgres_schema = body.postgres_schema;
    if ('html_to_markdown' in body)
      toolSettings.tools.html_to_markdown = body.html_to_markdown;
    if ('pdf_to_markdown' in body)
      toolSettings.tools.pdf_to_markdown = body.pdf_to_markdown;
    if ('code_exec_python' in body)
      toolSettings.tools.code_exec_python = body.code_exec_python;

    // Update cache
    if ('schema_cache' in body)
      toolSettings.cache.schema_cache = body.schema_cache;

    toolSettings.updated_at = new Date().toISOString();

    return NextResponse.json(toolSettings);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Invalid request body' },
      { status: 400 }
    );
  }
}
