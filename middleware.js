// app/middleware.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Halaman login/register bisa diakses siapa saja
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return NextResponse.next();
  }

  // Belum login → redirect ke login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Proteksi halaman admin (hanya admin)
  if (pathname.startsWith("/admin") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // Proteksi halaman petugas
if (pathname.startsWith("/petugas") && token.role !== "petugas" && token.role !== "admin") {
  return NextResponse.redirect(new URL("/unauthorized ", req.url));
}

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/petugas/:path*"],
};
