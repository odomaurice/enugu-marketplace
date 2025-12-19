import { NextResponse } from 'next/server';
import { authApi } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const { identifier } = await request.json();
    
    if (!identifier) {
      return NextResponse.json(
        { error: 'Identifier is required' },
        { status: 400 }
      );
    }

    const backendResponse = await authApi('/auth/initiate-login', {
      identifier
    });

    return NextResponse.json(backendResponse);

  } catch (error: unknown) {
    return NextResponse.json(
      { error:  'Authentication failed' },
      { status: 500 }
    );
  }
}