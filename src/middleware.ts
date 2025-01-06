import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const adminId = request.cookies.get("adminId")?.value || "";  // Check for admin login
    const userId = request.cookies.get("userId")?.value || "";  // Check for table order user login

    // Logic for AdminPanel
    if (request.nextUrl.pathname.startsWith('/AdminPanel')) {
        // If the user is already logged in as admin and tries to access the login page, redirect to AdminPanel
        if (adminId && request.nextUrl.pathname === '/login') {
            return NextResponse.redirect(new URL('/AdminPanel', request.url));
        }

        // If the user is not logged in as admin, redirect to login page
        if (!adminId) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Logic for Table-Order
    if (request.nextUrl.pathname.startsWith('/Table-Order')) {
        // If the user is already logged in as a table order user and tries to access the login page, redirect to Table-Order
        if (userId && request.nextUrl.pathname === '/login-table') {
            return NextResponse.redirect(new URL('/Table-Order', request.url));
        }

        // If the user is not logged in as table order user, redirect to login-table page
        if (!userId) {
            return NextResponse.redirect(new URL('/login-table', request.url));
        }
    }

    // If the user is logged in and tries to access the login pages, redirect to appropriate dashboard
    if (adminId && request.nextUrl.pathname === '/login') {
        return NextResponse.redirect(new URL('/AdminPanel', request.url));
    }

    if (userId && request.nextUrl.pathname === '/login-table') {
        return NextResponse.redirect(new URL('/Table-Order', request.url));
    }

    // Allow access to other routes
    return NextResponse.next();
}

// Matching paths for both AdminPanel and Table-Order
export const config = {
  matcher: ['/AdminPanel/:path*', '/login', '/Table-Order/:path*', '/login-table'],
};
