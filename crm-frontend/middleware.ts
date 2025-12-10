// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Minimal middleware that just forwards requests
export default function middleware(req: NextRequest) {
  return NextResponse.next();
}

// apply to all non-static routes (optional)
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
