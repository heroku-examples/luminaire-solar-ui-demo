import { NextRequest, NextResponse } from 'next/server';

// Shared state (in production, this would be a database)
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

// Helper function to check authorization
function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  return true;
}

// DELETE /api/tool-settings/whitelists/pdfs/[id]
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
  const index = pdfWhitelist.findIndex((item) => item.id === id);

  if (index === -1) {
    return NextResponse.json(
      { error: 'Not Found', message: 'PDF not found' },
      { status: 404 }
    );
  }

  pdfWhitelist.splice(index, 1);

  return NextResponse.json({
    success: true,
    message: 'PDF removed from whitelist',
  });
}
