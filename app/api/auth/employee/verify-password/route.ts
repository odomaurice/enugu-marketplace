import { NextResponse } from 'next/server';
import { authApi } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const { userId, password } = await request.json();
    
    if (!userId || !password) {
      return NextResponse.json(
        { error: 'User ID and password are required' },
        { status: 400 }
      );
    }

    const response = await authApi('/auth/verify-password', {
      userId,
      password
    });

    return NextResponse.json(response);

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Password verification failed' },
      { status: 500 }
    );
  }
}