import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. If no token and not on login page, redirect to login
  if (!token && !pathname.startsWith('/login') && pathname !== '/favicon.ico') {
    const url = new URL('/login', request.url);
    // Optional: save the intended destination to redirect back after login
    // url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // 2. If token exists and user is on login page, redirect to home
  if (token && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
