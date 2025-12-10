"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { NAV_ITEMS } from "@/lib/navigation"
import { Button } from "./ui/button"

export default function NavMenu() {
  const pathname = usePathname()

  return (
    <nav className="h-11 px-6 hidden md:flex items-center border-foreground/10">
      <div className="flex gap-6">
        {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
                <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={`gap-2 px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 ${
                        isActive
                          ? "bg-linear-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 hover:from-blue-500/30 hover:to-cyan-500/30 drop-shadow-border shadow-blue-500/30 shadow-2xl animate-glow-pulse"
                          : "text-gray-400 hover:text-foreground hover:bg-foreground/5"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Button>
                </Link>
            )
        })}
      </div>
    </nav>
  )
}
