// components/nav-bar-client.tsx
"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { ReactNode, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, Home, LayoutDashboard, CreditCard, Settings, Info, DollarSign, RotateCcw, Bookmark, TrendingUp, User } from "lucide-react"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "./ui/dialog"
import { useDirtyState } from "./dirty-state-provider"
import Logo from "./shared/logo"

// Navigation items for authenticated users
const authenticatedNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Saved", href: "/saved", icon: Bookmark },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
]

// Navigation items for guest/unauthenticated users
const guestNavItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Pricing", href: "/pricing", icon: DollarSign },
  { name: "How it works", href: "/how-it-works", icon: Info },
]

// Mobile bottom-bar items shown for authenticated users
const authenticatedMobileItems = [
  { name: "Home", href: "/dashboard", icon: Home, dot: false },
  { name: "Saved", href: "/saved", icon: Bookmark, dot: false },
  { name: "Billing", href: "/billing", icon: CreditCard, dot: false },
  { name: "Profile", href: "/settings", icon: User, dot: false },
]

// Mobile bottom-bar items shown for guests
const guestMobileItems = [
  { name: "Home", href: "/", icon: Home, dot: false },
  { name: "Pricing", href: "/pricing", icon: DollarSign, dot: false },
  { name: "How it works", href: "/how-it-works", icon: Info, dot: false },
  { name: "Profile", href: "/login", icon: User, dot: false },
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
  const mobileItems = isAuthenticated ? authenticatedMobileItems : guestMobileItems
  const pathname = usePathname()

  // Logo routes to dashboard when logged in, landing page otherwise
  const logoHref = isAuthenticated ? "/dashboard" : "/"

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
    <>
    {/* Top sticky nav — desktop only. Hidden on mobile so the bottom bar is
        the sole nav surface (per finalization spec). */}
    <nav className="hidden md:block sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter-bg-card/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between align-middle">
          {/* Logo */}
          <Link
            href={logoHref}
            className="flex items-center gap-2"
            onClick={(e) => handleLinkClick(e, logoHref)}
          >
            <span className="text-2xl font-semibold flex items-center gap-2">
              <div className="mt-4">
                <Logo height={100} width={100} />
              </div>
              <span className="text-primary neon-glow">MAFS</span>
              <span className="hidden text-sm font-normal text-muted-foreground lg:inline">
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
          </div>
        </div>
      </div>
    </nav>

    {/* Mobile compact top bar — just the avatar/login control so the user is
        never stranded without an account entry point. The 5 primary tabs live
        in the bottom bar below. */}
    <div className="md:hidden sticky top-0 z-40 border-b border-border/60 bg-card/95 backdrop-blur supports-backdrop-filter-bg-card/80 pt-[env(safe-area-inset-top)]">
      <div className="flex h-12 items-center justify-between px-4">
        <Link
          href={logoHref}
          className="flex items-center gap-2"
          onClick={(e) => handleLinkClick(e, logoHref)}
        >
          <span className="text-lg font-semibold text-primary neon-glow">MAFS</span>
          {isAuthenticated && !isPro && (
            <span className="ml-2 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              {remainingRuns} left
            </span>
          )}
        </Link>
        <div className="flex items-center">{children}</div>
      </div>
    </div>

    {/* Mobile Bottom Nav — sibling of <nav> (NOT a child of any sticky/transformed
        ancestor) so iOS Capacitor's `position: fixed` resolves to the viewport
        bottom, not to a transformed parent's box. */}
    <nav
      aria-label="Primary mobile navigation"
      className="md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-card/95 backdrop-blur supports-backdrop-filter-bg-card/80 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-5 h-16 pt-1">
        {mobileItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => handleLinkClick(e, item.href)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-10 rounded-full bg-primary shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              )}
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.dot && (
                  <span className="absolute -top-0.5 -right-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                )}
              </div>
              <span className="leading-none">{item.name}</span>
            </Link>
          )
        })}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="relative flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
          <span className="leading-none">More</span>
        </button>
      </div>
    </nav>

      {/* Mobile Menu Dialog */}
      <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <DialogContent
          className="fixed inset-y-0 right-0 left-auto h-full w-[280px] max-w-[80vw] translate-x-0 translate-y-0 rounded-none border-l data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right duration-300"
          showCloseButton={false}
        >
          <DialogHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center align-middle gap-2">
                <Logo height={70} width={70} />
                <span className="text-primary mb-4">MAFS</span>
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
    </>
  )
}