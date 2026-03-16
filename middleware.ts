import { NextRequest, NextResponse } from 'next/server';

const LOGIN_PATH = process.env.NEXT_PUBLIC_AUTH_LOGIN_PATH ?? '/auth/login';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get('pb_auth');

  const isAuthRoute = pathname.startsWith('/auth');
  const isPublicAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/api');

  if (!authCookie && !isAuthRoute && !isPublicAsset) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Proteger todas las rutas excepto las listadas arriba
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|auth|api).*)'],
};
