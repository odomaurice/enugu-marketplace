import { NextResponse } from 'next/server';
import { authApi } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const { userId, phone_number } = await request.json();
    
    if (!userId || !phone_number) {
      return NextResponse.json(
        { error: 'User ID and phone number are required' },
        { status: 400 }
      );
    }

    const response = await authApi('/auth/set-phone-number', {
      userId,
      phone_number
    });

    return NextResponse.json(response);

  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Phone number setup failed' },
      { status: 500 }
    );
  }
}