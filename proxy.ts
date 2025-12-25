import { NextResponse, NextRequest } from 'next/server'
import { auth } from './lib/auth/auth'

export async function proxy(request: NextRequest) {
  // Get session for protected routes
  const session = await auth.api.getSession(request)
  
  // Check if route is protected
  const isProtectedRoute = ['/dashboard', '/settings', '/billing'].some(path => 
    request.nextUrl.pathname.startsWith(path)
  )
  
  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }
  
  // Continue with the request and add pathname header
  const response = NextResponse.next()
  response.headers.set('x-pathname', request.nextUrl.pathname)
  // Add session status to headers so we can access it in Server Components
  response.headers.set('x-has-session', session ? 'true' : 'false')
  
  return response
}

export const config = {
  // Match all routes except static files and API routes
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}