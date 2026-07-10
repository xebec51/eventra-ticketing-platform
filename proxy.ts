import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { UserRole } from "@/app/generated/prisma/enums";
import {
  canAccessRolePath,
  getDashboardHome,
  getOrganizerStatusRedirect,
} from "@/lib/auth-helpers";
import type { UserStatus } from "@/lib/types";

const authRoutes = new Set(["/login", "/register", "/register/organizer"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  });

  if (authRoutes.has(pathname) && token?.role) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  if (!token?.role || !token.status) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/dashboard") {
    const organizerRedirect = getOrganizerStatusRedirect(token.status as UserStatus);

    if (token.role === UserRole.ORGANIZER && organizerRedirect) {
      return NextResponse.redirect(new URL(organizerRedirect, request.url));
    }

    return NextResponse.redirect(
      new URL(getDashboardHome(token.role), request.url)
    );
  }

  if (token.role === UserRole.ORGANIZER) {
    const organizerRedirect = getOrganizerStatusRedirect(token.status as UserStatus);

    if (organizerRedirect) {
      return NextResponse.redirect(new URL(organizerRedirect, request.url));
    }
  }

  if (
    !canAccessRolePath(
      token.role,
      pathname,
      token.status as UserStatus
    )
  ) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
