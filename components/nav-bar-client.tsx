// components/nav-bar-client.tsx
"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { ReactNode, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, Home, LayoutDashboard, CreditCard, Settings, Info, DollarSign, RotateCcw } from "lucide-react"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "./ui/dialog"
import { useDirtyState } from "./dirty-state-provider"

// Navigation items for authenticated users
const authenticatedNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
]

// Navigation items for guest/unauthenticated users
const guestNavItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Pricing", href: "/pricing", icon: DollarSign },
  { name: "How it works", href: "/how-it-works", icon: Info },
]

interface NavBarClientProps {
  isAuthenticated: boolean
  isPro: boolean
  children: ReactNode // This will be the NavAvatar
  analysisCount: number
}

export function NavBarClient({ isAuthenticated, isPro, children, analysisCount }: NavBarClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { confirmNavigation } = useDirtyState()
  const router = useRouter()

  // Choose nav items based on authentication status
  const navItems = isAuthenticated ? authenticatedNavItems : guestNavItems
  const pathname = usePathname()

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault()
    confirmNavigation(() => router.push(href))
  }

  const handleMobileLinkClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault()
    confirmNavigation(() => {
      setMobileMenuOpen(false)
      router.push(href)
    })
  }

  const remainingRuns = Math.max(0, 3 - analysisCount)

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter-bg-card/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={(e) => handleLinkClick(e, "/")}
          >
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

          {/* Center Nav - Desktop Only */}
          <div className="hidden items-end gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleLinkClick(e, item.href)}
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
            {/* Only show plan badge for authenticated users - hidden on mobile */}
            {isAuthenticated && !isPro && (
              <div className="hidden sm:block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Free Plan – {remainingRuns} Analysis runs left
              </div>
            )}

            {children} {/* NavAvatar rendered here - shows Login or Avatar */}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dialog */}
      <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <DialogContent
          className="fixed inset-y-0 right-0 left-auto h-full w-[280px] max-w-[80vw] translate-x-0 translate-y-0 rounded-none border-l data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right duration-300"
          showCloseButton={false}
        >
          <DialogHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <circle cx="12" cy="12" r="6" strokeWidth="2" />
                    <circle cx="12" cy="12" r="2" strokeWidth="2" fill="currentColor" />
                  </svg>
                </div>
                <span className="text-primary">MAFS</span>
              </DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" aria-label="Close menu">
                  <X className="h-5 w-5" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>

          {/* Mobile Navigation Links */}
          <div className="flex flex-col gap-2 py-4">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleMobileLinkClick(e, item.href)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Plan Badge for Mobile */}
          {isAuthenticated && (
            <div className="mt-auto border-t border-border pt-4">
              <div className={cn(
                "rounded-lg border px-4 py-3 text-center text-sm font-medium",
                isPro
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                  : "border-primary/30 bg-primary/10 text-primary"
              )}>
                {isPro ? "PRO Plan" : `Free Plan – ${remainingRuns} Analysis runs left`}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </nav>
  )
}