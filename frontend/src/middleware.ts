import { NextResponse, NextRequest } from "next/server";

export const config = {
  matcher: "/api/:path*",
};

const DEFAULT_FRONTEND_TO_BACKEND_URL = "http://127.0.0.1";
const DEFAULT_BACKEND_BIND_PORT = "8080";

export function middleware(request: NextRequest) {
  return NextResponse.rewrite(
    new URL(
      `${process.env.FRONTEND_TO_BACKEND_URL || DEFAULT_FRONTEND_TO_BACKEND_URL}:${process.env.BACKEND_BIND_PORT || DEFAULT_BACKEND_BIND_PORT}${request.nextUrl.pathname}${request.nextUrl.search}`,
    ),
    { request },
  );
}
