import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_for_hackathon'
);

// Add routes that should be accessible without authentication here
const publicRoutes = ['/', '/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current route is a public route
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow access to Next.js static files, images, and favicon
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.') // typically matches files like .ico, .png, etc.
  ) {
    return NextResponse.next();
  }

  // Get the token from cookies
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    // No token found, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify the JWT token using jose
    await jwtVerify(token, JWT_SECRET);
    // Token is valid, allow request to proceed
    return NextResponse.next();
  } catch (error) {
    // Token verification failed (expired, invalid), redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  // Apply middleware to all routes
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
