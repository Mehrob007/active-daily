import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const routeRoleMappings: { prefix: string, roles: number[] }[] = [
  { prefix: '/agent/dipozit', roles: [12] },
  { prefix: '/agent/card', roles: [10] },
  { prefix: '/agent/my-applications', roles: [10] },
  { prefix: '/agent/applications-list', roles: [10] },
  { prefix: '/agent/knowledge-base', roles: [10] },
  { prefix: '/credit', roles: [11] },
  { prefix: '/agent-qr', roles: [13] },
  { prefix: '/agent-sms', roles: [14] },
  { prefix: '/agent-transaction', roles: [15] },
  { prefix: '/agent-custom', roles: [16] },
  { prefix: '/cashback', roles: [23] },
  { prefix: '/agent-payments', roles: [24] },
  { prefix: '/pvn', roles: [25] },
  { prefix: '/accounts-qr', roles: [13, 26] },
  { prefix: '/atm', roles: [19] },
  { prefix: '/chairman', roles: [9] },
  { prefix: '/director', roles: [5] },
  { prefix: '/frontovik', roles: [17] },
  { prefix: '/processing/transactions', roles: [18, 17] },
  { prefix: '/processing/limits', roles: [18, 17] },
  { prefix: '/processing-search', roles: [21] },
  { prefix: '/client-documents', roles: [27] },
  { prefix: '/card-balance', roles: [28] },
  { prefix: '/accounts', roles: [20, 17] },
  { prefix: '/operator', roles: [3] },
  { prefix: '/product', roles: [22] },
  { prefix: '/worker', roles: [6, 8] },
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const roleIdsStr = request.cookies.get('role_ids')?.value;
  const { pathname } = request.nextUrl;

  if (!token && !pathname.startsWith('/login') && pathname !== '/auth/register' && pathname !== '/favicon.ico') {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  if (token && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (token && pathname !== '/') {
    let userRoles: number[] = [];
    try {
      if (roleIdsStr) {
        userRoles = JSON.parse(roleIdsStr);
      }
    } catch (e) {
      // ignore
    }

    const matchedMapping = routeRoleMappings.find(mapping => pathname.startsWith(mapping.prefix));
    if (matchedMapping) {
      const hasAccess = matchedMapping.roles.some(r => userRoles.includes(r));
      if (!hasAccess) {
        // Here we could redirect to a 403 page, but preserving old behavior of /404
        return NextResponse.redirect(new URL('/404', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
