import { NextResponse } from 'next/server';
import { authApi } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const { userId, otp } = await request.json();

    const backendResponse = await authApi('/auth/verify-otp', {
      userId,
      otp
    });

    return NextResponse.json(backendResponse);

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'OTP verification failed' },
      { status: 500 }
    );
  }
}