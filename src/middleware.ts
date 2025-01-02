import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const adminId = request.cookies.get("adminId")?.value || "";

    // If the user is already logged in and tries to access the login page, redirect to AdminPanel
    if (adminId && request.nextUrl.pathname === '/login') {
        return NextResponse.redirect(new URL('/AdminPanel', request.url));
    }

    // If the user is not logged in and tries to access AdminPanel, redirect to login
    if (!adminId && request.nextUrl.pathname.startsWith('/AdminPanel')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If the user is not logged in and not on the login page, allow access
    return NextResponse.next();
}

// Matching paths for AdminPanel and its sub-paths
export const config = {
  matcher: ['/AdminPanel/:path*', '/login'], 
};
