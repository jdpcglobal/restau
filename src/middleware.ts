import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    const adminId = request.cookies.get("adminId")?.value || "";

    // If the token exists, redirect to AdminPanel
    if (adminId && request.nextUrl.pathname === '/login') {
        // User is already logged in, redirect to AdminPanel
        return NextResponse.redirect(new URL('/AdminPanel', request.url));
    }

    // If the token doesn't exist and the user is trying to access AdminPanel, redirect to login
    if (!adminId && request.nextUrl.pathname.startsWith('/AdminPanel')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If the user is not logged in and not on login page, allow access
    return NextResponse.next()
}

// Matching paths for AdminPanel and its sub-paths
export const config = {
  matcher: '/AdminPanel/:path*',
};
