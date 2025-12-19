import { NextResponse } from 'next/server';
import { authApi } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const response = await authApi('/auth/resend-otp', {
      userId
    });

    return NextResponse.json(response);

  } catch (error: unknown) {
    return NextResponse.json(
      { error:  'Failed to resend OTP' },
      { status: 500 }
    );
  }
}