import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

function getRoleDashboardPath(role?: string) {
  if (role === "Guru Pembimbing" || role === "Pembimbing Sekolah") {
    return "/dashboard/teacher";
  }
  if (role === "Admin" || role === "Admin Sekolah" || role === "Kepala Sekolah") {
    return "/dashboard/admin";
  }
  return "/dashboard/student";
}

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "interntrack-secret-key-2026",
  });

  const { pathname } = request.nextUrl;
  const userRole = (token?.role as string) || "Siswa";

  // Protect /dashboard and all sub-routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    } else if (token.setupComplete === false) {
      return NextResponse.redirect(new URL("/login?mode=onboarding", request.url));
    }

    // Role-based authorization for dedicated dashboards
    if (pathname === "/dashboard") {
      return NextResponse.redirect(new URL(getRoleDashboardPath(userRole), request.url));
    }

    if (pathname.startsWith("/dashboard/admin")) {
      const isAdmin = userRole === "Admin" || userRole === "Admin Sekolah" || userRole === "Kepala Sekolah";
      if (!isAdmin) {
        return NextResponse.redirect(new URL(getRoleDashboardPath(userRole), request.url));
      }
    }

    if (pathname.startsWith("/dashboard/teacher")) {
      const isTeacher = userRole === "Guru Pembimbing" || userRole === "Pembimbing Sekolah";
      if (!isTeacher) {
        return NextResponse.redirect(new URL(getRoleDashboardPath(userRole), request.url));
      }
    }

    if (pathname.startsWith("/dashboard/student")) {
      const isStudent = userRole === "Siswa";
      if (!isStudent) {
        return NextResponse.redirect(new URL(getRoleDashboardPath(userRole), request.url));
      }
    }
  }

  // Redirect authenticated users away from /login or / to their role dashboard
  if (token && (pathname === "/login" || pathname === "/")) {
    if (token.setupComplete === false) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL(getRoleDashboardPath(userRole), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/api/protected/:path*",
  ],
};
