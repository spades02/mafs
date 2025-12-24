"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import NavAvatar from "./nav-avatar"

const navItems = [
  { name: "Home", href: "/" },
  // { name: "My Plays", href: "/my-plays" },
  // { name: "History", href: "/history" },
  { name: "Pricing", href: "/pricing" },
  { name: "How it works?", href: "/how-it-works" },
]

export default function GuestNavbar() {
  const pathname = usePathname()
  const authRoutes = ['/auth/login', '/auth/signup', '/auth/forgot-password']
  const hideAuthButtons = authRoutes.includes(pathname)

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

          {/* Center Nav */}
          <div className="hidden items-center gap-1 md:flex">
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
            <div className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Free Plan – 1 fight/day
            </div>
            {!hideAuthButtons && <NavAvatar />}
          </div>
        </div>
      </div>
    </nav>
  )
}
