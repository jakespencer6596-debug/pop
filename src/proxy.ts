import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

/**
 * Optimistic redirect for admin pages: if the session cookie is absent,
 * send the visitor to /login. Real session validation happens server-side
 * in every admin page and mutating API route.
 */
export function proxy(request: NextRequest) {
  const hasCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  if (!hasCookie) {
    const url = new URL("/login", request.nextUrl);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Admin surface only. Public pages (/live, /pay, /login) and all API
  // routes handle their own auth.
  matcher: ["/", "/new", "/t/:path*"],
};
