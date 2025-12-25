// components/guest-navbar-client.tsx
"use client"

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface GuestNavbarClientProps {
  pathname: string
}

export function GuestNavbarClient({ pathname }: GuestNavbarClientProps) {
  const navigationItems = [
    { name: 'Home', href: '/' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'How MAFS Works', href: '/how-it-works' }
  ]

  return (
    <div className="hidden md:flex items-center gap-1">
      {navigationItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === item.href
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {item.name}
        </Link>
      ))}
    </div>
  )
}