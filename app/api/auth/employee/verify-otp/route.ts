
import { NextResponse } from 'next/server';

// Mock API client - replace with your actual API client
const authApi = async (endpoint: string, data: any) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    if (error.message.includes('fetch') || error.message.includes('Network')) {
      throw new Error('Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
};

export async function POST(request: Request) {
  try {
    const { userId, otp } = await request.json();

    if (!userId || !otp) {
      return NextResponse.json(
        { error: 'User ID and OTP are required' },
        { status: 400 }
      );
    }

    const backendResponse = await authApi('/auth/verify-otp', {
      userId,
      otp
    });

    return NextResponse.json(backendResponse);

  } catch (error: any) {
    console.error('OTP verification API error:', error);
    
    let statusCode = 500;
    let errorMessage = error.message || 'OTP verification failed';
    
    // Map specific errors to appropriate status codes
    if (error.message.includes('Unable to connect')) {
      statusCode = 503; // Service Unavailable
    } else if (error.message.includes('Invalid') || error.message.includes('expired')) {
      statusCode = 400; // Bad Request
    } else if (error.message.includes('not found')) {
      statusCode = 404; // Not Found
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        success: false 
      },
      { status: statusCode }
    );
  }
}