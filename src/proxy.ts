import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { isPublicPathname } from "@/lib/auth-routes";

const loginPath = "/login";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPathname(pathname)) {
    if (pathname === loginPath || pathname.startsWith(`${loginPath}/`)) {
      const session = await auth.api.getSession({
        headers: request.headers,
      });
      if (session) {
        const next = request.nextUrl.searchParams.get("callbackUrl");
        const safe =
          next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
        return NextResponse.redirect(new URL(safe, request.url));
      }
    }
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    const loginUrl = new URL(loginPath, request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("callbackUrl", pathname + request.nextUrl.search);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
