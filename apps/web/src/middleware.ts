import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n/config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // English at root, others prefixed /es/...
});

const SETUP_DONE_COOKIE = 'dlm_setup_done';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip API routes and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/uploads/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // ── Setup wizard protection ──────────────────────────────────────────────
  // Block /setup (and /es/setup) once installation is complete
  const isSetupRoute =
    pathname === '/setup' ||
    pathname.startsWith('/setup/') ||
    pathname === '/es/setup' ||
    pathname.startsWith('/es/setup/');

  if (isSetupRoute) {
    // Fast path: cookie already set
    const setupDone = request.cookies.get(SETUP_DONE_COOKIE)?.value;
    if (setupDone === '1') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Verify against API (server-side fetch)
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const res = await fetch(`${apiUrl}/setup/status`, { cache: 'no-store' });
      if (res.ok) {
        const data = (await res.json()) as { complete: boolean };
        if (data.complete) {
          const response = NextResponse.redirect(new URL('/', request.url));
          response.cookies.set(SETUP_DONE_COOKIE, '1', {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 365, // 1 year
          });
          return response;
        }
      }
    } catch {
      // If API is unreachable allow the setup page to display its own error
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
