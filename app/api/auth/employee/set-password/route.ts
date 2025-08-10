import { NextResponse } from 'next/server';
import { authApi } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const { userId, password, password_confirmation } = await request.json();
    
    if (!userId || !password || !password_confirmation) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const response = await authApi('/auth/set-password', {
      userId,
      password,
      password_confirmation
    });

    return NextResponse.json(response);

  } catch (error: unknown) {
    return NextResponse.json(
      { error:  'Password setup failed' },
      { status: 500 }
    );
  }
}