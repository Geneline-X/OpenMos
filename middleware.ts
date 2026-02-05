import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes - let them through, ProtectedPageWrapper handles auth modal
  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Check for /evaluate routes - require session, redirect to /start if missing
  if (pathname.startsWith("/evaluate")) {
    const sessionToken = request.cookies.get("openmos_session");
    
    // If no session, redirect to onboarding
    if (!sessionToken) {
      return NextResponse.redirect(new URL("/start", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/evaluate/:path*",
  ],
};
