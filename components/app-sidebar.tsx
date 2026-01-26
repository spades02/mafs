"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, LayoutDashboard, Settings, CreditCard, FileText } from "lucide-react"
import { Button } from "./ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useDirtyState } from "./dirty-state-provider"

export function AppSidebar({ runs }: { runs: { id: string; title: string; createdAt: Date }[] }) {
    const [collapsed, setCollapsed] = useState(true)
    const pathname = usePathname()

    return (
        <aside className={cn(
            "h-[calc(100vh-65px)] sticky top-[65px] bg-[#0b0f14] border-r border-primary/10 transition-all duration-300 flex flex-col z-30 hidden md:flex",
            collapsed ? "w-16" : "w-64"
        )}>
            {/* Header / Toggle */}
            <div className="p-4 flex items-center justify-between h-14 border-b border-primary/10">
                {!collapsed && <span className="font-bold text-sm text-primary">Menu</span>}
                <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="h-6 w-6 ml-auto hover:bg-primary/10 text-primary/70">
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            {/* Main Nav */}
            <div className="flex-1 py-4 flex flex-col gap-4 overflow-hidden">
                <nav className="grid gap-1 px-2">
                    <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} active={pathname === "/dashboard"} />
                    <NavItem href="/settings" icon={Settings} label="Settings" collapsed={collapsed} active={pathname === "/settings"} />
                    <NavItem href="/billing" icon={CreditCard} label="Billing" collapsed={collapsed} active={pathname === "/billing"} />
                </nav>

                <div className="border-t border-primary/10 mx-2"></div>

                {/* Runs List - Completely hidden when collapsed */}
                {!collapsed && (
                    <ScrollArea className="flex-1 px-2 w-full">
                        <div className="mb-2 px-2 mt-4">
                            <h3 className="text-xs font-semibold text-primary/50 uppercase tracking-wider">Analysis History</h3>
                        </div>

                        <div className="grid gap-1 mt-2">
                            {runs.length === 0 && (
                                <p className="text-xs text-muted-foreground px-2 py-2">No runs yet.</p>
                            )}

                            {runs.map(run => {
                                const displayTitle = run.title ? run.title.split(':')[0].trim() : "Untitled Analysis"
                                return (
                                    <NavItem
                                        key={run.id}
                                        href={`/analysis/${run.id}`}
                                        icon={FileText}
                                        label={displayTitle}
                                        collapsed={collapsed}
                                        active={pathname === `/analysis/${run.id}`}
                                        tooltip={run.title}
                                    />
                                )
                            })}
                        </div>
                    </ScrollArea>
                )}
            </div>
        </aside>
    )
}

function NavItem({ href, icon: Icon, label, collapsed, active, tooltip }: any) {
    const { confirmNavigation } = useDirtyState()
    const router = useRouter()

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault()
        confirmNavigation(() => router.push(href))
    }

    const content = (
        <Link
            href={href}
            onClick={handleClick}
            className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-all group overflow-hidden whitespace-nowrap",
                active ? "bg-primary/10 text-primary border border-primary/10" : "hover:bg-primary/5 text-muted-foreground hover:text-primary border border-transparent",
                collapsed ? "justify-center px-2 w-10 mx-auto" : "w-full"
            )}
        >
            <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
            {!collapsed && <span className="truncate text-sm font-medium">{label}</span>}
        </Link>
    )

    const shouldShowTooltip = tooltip || collapsed;
    const tooltipText = tooltip || label;

    if (!shouldShowTooltip) return content;

    return (
        <TooltipProvider>
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    {content}
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-[#0b0f14] text-gray-200 border-primary/20">
                    <p>{tooltipText}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
