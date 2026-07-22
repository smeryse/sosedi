import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

function isProtectedPath(pathname: string): boolean {
  return (
    pathname === "/app" ||
    pathname.startsWith("/app/") ||
    pathname === "/owner" ||
    pathname.startsWith("/owner/")
  );
}

export function middleware(request: NextRequest) {
  if (!isProtectedPath(request.nextUrl.pathname)) return NextResponse.next();
  if (request.cookies.get(SESSION_COOKIE_NAME)?.value) return NextResponse.next();
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return NextResponse.next();

  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("redirect", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/app", "/app/:path*", "/owner", "/owner/:path*"],
};
