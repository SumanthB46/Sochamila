import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

type JwtPayload = {
  role: "ADMIN" | "VENDOR" | "CUSTOMER" | "DESIGNER";
  id: string;
  exp: number;
};

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    // Token expired
    if (decoded.exp * 1000 < Date.now()) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Role-based route access
    const pathname = req.nextUrl.pathname;

    // Admin routes - only ADMIN role
    if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/vendors")) {
      if (decoded.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Vendor routes - only VENDOR role
    if (pathname.startsWith("/admin/vendors")) {
      if (decoded.role !== "VENDOR") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
