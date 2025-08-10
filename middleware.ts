import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';
import type { NextRequestWithAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    const { pathname, searchParams } = request.nextUrl;
    const token = request.nextauth.token;

    // Public routes
    if (pathname.startsWith('/api/auth')) {
      return NextResponse.next();
    }

    // Handle login pages
    if (pathname === '/admin-login' || pathname === '/employee-login') {
      if (token) {
        // If already logged in, redirect to appropriate dashboard
        const redirectPath = token.role === 'admin' 
          ? '/admin-dashboard' 
          : '/employee-dashboard';
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
      return NextResponse.next();
    }

    // Handle protected routes
    if (pathname.startsWith('/admin-dashboard')) {
      if (!token || token.role !== 'admin') {
        return NextResponse.redirect(new URL('/admin-login', request.url));
      }
      return NextResponse.next();
    }

    if (pathname.startsWith('/employee-dashboard')) {
      if (!token || token.role !== 'user') {
        return NextResponse.redirect(new URL('/employee-login', request.url));
      }
      return NextResponse.next();
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // We handle authorization in the middleware function
    },
  }
);

export const config = {
  matcher: [
    '/admin-dashboard/:path*',
    '/employee-dashboard/:path*',
    '/admin-login',
    '/employee-login'
  ]
};