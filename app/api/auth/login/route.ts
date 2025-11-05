import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

interface User {
  id: string;
  username: string;
  email?: string;
}

interface SessionData {
  user?: User;
  authorization?: string;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET || 'setaluminairesolaruisessionsecret',
  cookieName: 'luminaire-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 1 week
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // ALWAYS use the API - no mocking
    const apiUrl = process.env.API_URL || 'http://0.0.0.0:3001';
    
    // Use the credentials provided by the user
    const apiCredentials = {
      username,
      password,
      statusCode: 200  // Backend expects this field
    };
    
    const response = await fetch(`${apiUrl}/api/user/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiCredentials),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Authentication failed:', errorText);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const data = await response.json();
    const authorization = data.authorization;
    
    // Decode the JWT to get user data (the user is embedded in the token)
    // Parse JWT payload (base64 decode the middle part)
    let user;
    if (authorization) {
      const tokenParts = authorization.split('.');
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      user = payload.user;
    }

    // Create session
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    session.user = user;
    session.authorization = authorization;
    await session.save();

    return NextResponse.json({ user, authorization });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
