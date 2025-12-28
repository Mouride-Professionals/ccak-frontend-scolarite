import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/deliberations/:path*",
    "/faculties/:path*",
    "/departments/:path*",
    "/students/:path*",
    "/enrollments/:path*",
    "/notes/:path*",
    "/stats/:path*",
    "/calendar/:path*",
    "/admin/:path*",
  ],
};
