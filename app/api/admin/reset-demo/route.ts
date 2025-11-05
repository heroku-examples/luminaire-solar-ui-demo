import { NextRequest, NextResponse } from 'next/server';

// Helper function to check authorization
function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  return true;
}

// POST /api/admin/reset-demo
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Missing or invalid authorization' },
      { status: 401 }
    );
  }

  // In a real application, this would:
  // 1. Clear all user data
  // 2. Reset all settings to defaults
  // 3. Reseed the database with fresh demo data
  // 4. Clear sessions

  // For this demo, we'll just return success
  return NextResponse.json({
    success: true,
    message: 'Demo data has been reset successfully',
  });
}

