import { NextResponse, NextRequest } from "next/server"
import { auth } from "@/app/lib/auth/auth"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignore API, static files, etc. managed by matcher mostly, but good to be safe
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/_next')) {
    return NextResponse.next()
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  })

  const isAuthenticated = !!session?.user
  // Check verification functionality
  const isVerified = session?.user?.emailVerified

  // Define route types
  // Note: App Folders are virtual (e.g. (app)), so URLs are still /dashboard
  const protectedRoutes = ["/dashboard", "/settings", "/billing", "/analysis", "/my-plays", "/history"]
  const authRoutes = ["/auth/login", "/auth/signup", "/auth/forgot-password", "/auth/reset-password"]
  const verifyPage = "/verify-email"

  const isProtectedRoute = protectedRoutes.some((r) => pathname.startsWith(r))
  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r))
  const isVerifyPage = pathname === verifyPage

  // 1. If Logged In but NOT Verified
  if (isAuthenticated && !isVerified) {
    // Allow access to verification page only
    if (!isVerifyPage) {
      return NextResponse.redirect(new URL("/verify-email", request.url))
    }
    // Allow request to proceed to verify-email
    return NextResponse.next()
  }

  // 2. If Logged In AND Verified (or verification not required)
  if (isAuthenticated && isVerified) {
    // Redirect away from verify page if already verified
    if (isVerifyPage) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    // Redirect away from auth pages (login/signup)
    if (isAuthRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // 3. Not Logged In
  if (!isAuthenticated) {
    // Protect routes
    if (isProtectedRoute || isVerifyPage) {
      // isVerifyPage requires auth to check verification status, so redirect to login
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes? No, usually exclude API
    '/(api|trpc)(.*)',
  ],
}
