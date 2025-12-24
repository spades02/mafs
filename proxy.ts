import { NextResponse, NextRequest } from 'next/server'
import { auth } from './lib/auth/auth'

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
    const session = await auth.api.getSession(request)
    if(!session){
        return NextResponse.redirect(new URL("/auth/login", request.url))
    }
}
 
export const config = {
  matcher: ['/dashboard/:path*','/settings/:path*', '/billing/:path*'],
}