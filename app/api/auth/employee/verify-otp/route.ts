import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId, otp } = await request.json();

    const backendResponse = await fetch(
      'https://enugu-state-food-bank.onrender.com/api/v1/auth/verify-otp',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, otp }),
      }
    );

    // First check if response is JSON
    const contentType = backendResponse.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await backendResponse.text();
      throw new Error(`Unexpected response: ${text}`);
    }

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: data.message || 'OTP verification failed' },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}