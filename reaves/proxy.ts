import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware — adds CORS headers to all /api/* routes.
 * This allows the REAVES Chrome extension (chrome-extension:// origin)
 * to call the web app's API routes directly.
 */
export function proxy(req: NextRequest) {
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  // For all other requests, pass through and inject CORS headers on the response
  const res = NextResponse.next();
  const headers = corsHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.headers.set(key, value);
  }
  return res;
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export const config = {
  matcher: '/api/:path*',
};
