// components/guest-navbar.tsx
import { headers } from 'next/headers'
import { GuestNavbarClient } from './guest-navbar-client'
import NavAvatar from './nav-avatar'
import { Suspense } from 'react'
import { NavAvatarSkeleton } from './nav-avatar-skeleton'

export async function GuestNavbar() {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || '/'
  
  return (
    <nav className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="font-bold text-xl">
            Your Logo
          </div>
          
          {/* Navigation Links */}
          <GuestNavbarClient pathname={pathname} />
        </div>
        
        {/* Avatar */}
        <Suspense fallback={<NavAvatarSkeleton />}>
        <NavAvatar />
        </Suspense>
      </div>
    </nav>
  )
}