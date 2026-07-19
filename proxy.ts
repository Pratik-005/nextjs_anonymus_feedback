import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/sign-in",
        "/sign-up",
        "/",
        "/verify/:path*",
    ],
}

export async function proxy(request: NextRequest) {
    
    const token = await getToken({
        req: request,
        secret: process.env.NEXT_AUTH_SECRET, 
    });

    const { pathname } = request.nextUrl;

    // Redirect authenticated users away from public pages
    if (
        token &&
        (
            pathname.startsWith("/sign-in") ||
            pathname.startsWith("/sign-up") ||
            pathname.startsWith("/verify") ||
            pathname === "/"
        )
    ) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Protect dashboard routes
    if (!token && pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    return NextResponse.next();
}