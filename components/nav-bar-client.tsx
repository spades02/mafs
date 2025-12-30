// components/nav-bar-client.tsx
"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"
import { usePathname } from "next/navigation"

// Navigation items for authenticated users
const authenticatedNavItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Billing", href: "/billing" },
  { name: "Settings", href: "/settings" },
]

// Navigation items for guest/unauthenticated users
const guestNavItems = [
  { name: "Home", href: "/" },
  { name: "Pricing", href: "/pricing" },
  { name: "How it works", href: "/how-it-works" },
]

interface NavBarClientProps {
  isAuthenticated: boolean
  children: ReactNode // This will be the NavAvatar
}

export function NavBarClient({ isAuthenticated, children }: NavBarClientProps) {
  // Choose nav items based on authentication status
  const navItems = isAuthenticated ? authenticatedNavItems : guestNavItems
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter-bg-card/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <circle cx="12" cy="12" r="6" strokeWidth="2" />
                <circle cx="12" cy="12" r="2" strokeWidth="2" fill="currentColor" />
              </svg>
            </div>
            <span className="text-lg font-semibold">
              <span className="text-primary neon-glow">MAFS</span>
              <span className="ml-2 hidden text-sm font-normal text-muted-foreground md:inline">
                Multi-Agent Fight Simulator
              </span>
            </span>
          </Link>

          {/* Center Nav - Shows different items based on auth status */}
          <div className="hidden items-end gap-1 md:flex">
            {navItems.map((item) => (
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

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Only show plan badge for authenticated users */}
            {isAuthenticated && (
              <div className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Free Plan – 1 fight/day
              </div>
            )}
            {children} {/* NavAvatar rendered here - shows Login or Avatar */}
          </div>
        </div>
      </div>
    </nav>
  )
}