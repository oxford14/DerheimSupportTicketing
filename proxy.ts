import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const path = req.nextUrl.pathname;

  // Public
  if (path === "/login") {
    if (token)
      return NextResponse.redirect(
        new URL(
          token.role === "employee" ? "/dashboard" : "/admin/dashboard",
          req.url
        )
      );
    return NextResponse.next();
  }

  if (path === "/") {
    if (token)
      return NextResponse.redirect(
        new URL(
          token.role === "employee" ? "/dashboard" : "/admin/dashboard",
          req.url
        )
      );
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Protected: employee dashboard (agents/admins go to admin)
  if (path.startsWith("/dashboard")) {
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
    if (token.role === "agent" || token.role === "admin")
      return NextResponse.redirect(new URL("/admin/tickets", req.url));
    return NextResponse.next();
  }

  // Protected: admin area (agent or admin only)
  if (path.startsWith("/admin")) {
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
    if (token.role !== "agent" && token.role !== "admin")
      return NextResponse.redirect(new URL("/dashboard", req.url));
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*", "/admin/:path*"],
};
