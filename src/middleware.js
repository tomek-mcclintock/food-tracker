import { NextResponse } from 'next/server';

// List of public routes that don't require authentication
const publicRoutes = ['/login', '/signup'];

export function middleware(request) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  // Allow access to public routes even without token
  if (publicRoutes.includes(pathname)) {
    // If user is already logged in, redirect to history
    if (token) {
      return NextResponse.redirect(new URL('/history', request.url));
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};