// components/guest-navbar.tsx
import { headers } from 'next/headers'
import { GuestNavbarClient } from './guest-navbar-client'
import NavAvatar from './nav-avatar'
import { Suspense } from 'react'
import { NavAvatarSkeleton } from './nav-avatar-skeleton'
import Logo from './shared/logo'

export async function GuestNavbar() {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || '/'

  return (
    <nav className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="font-bold text-xl">
            <Logo height={100} width={100} />
          </div>

          {/* Navigation Links */}
          <GuestNavbarClient pathname={pathname} />
        </div>

        {/* Avatar */}
        <Suspense fallback={<NavAvatarSkeleton />}>
          {/* <NavAvatar /> */}
        </Suspense>
      </div>
    </nav>
  )
}