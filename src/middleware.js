import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protect all /api routes from direct browser address bar navigation
  if (pathname.startsWith('/api')) {
    const secFetchDest = request.headers.get('sec-fetch-dest');
    const secFetchMode = request.headers.get('sec-fetch-mode');
    const accept = request.headers.get('accept') || '';

    // Direct browser address bar navigation sends sec-fetch-dest: document and sec-fetch-mode: navigate
    const isDirectBrowserVisit =
      secFetchDest === 'document' &&
      secFetchMode === 'navigate' &&
      accept.includes('text/html');

    if (isDirectBrowserVisit) {
      return NextResponse.json(
        {
          success: false,
          message: 'Direct browser access to API endpoints is prohibited.',
          error: 'DIRECT_BROWSER_ACCESS_DENIED',
        },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
