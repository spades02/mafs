import { NextResponse, NextRequest } from "next/server"
import { auth } from "@/app/lib/auth/auth"

export async function proxy(request: NextRequest) {
  if (request.method !== "GET") {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  const session = await auth.api.getSession({
    headers: request.headers,
  })

  const isAuthenticated = !!session?.user

  const protectedRoutes = ["/dashboard", "/settings", "/billing"]
  const authRoutes = ["/auth/login", "/auth/signup"]

  const isProtectedRoute = protectedRoutes.some((r) => pathname.startsWith(r))
  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r))

  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api/auth|api|_next/static|_next/image|favicon.ico).*)",
  ],
}
