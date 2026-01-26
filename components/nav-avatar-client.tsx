// components/nav-avatar-client.tsx
"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Button } from './ui/button'
import { ChevronDown, CreditCard, Crown, RotateCcw, SettingsIcon, User } from 'lucide-react'
import Link from 'next/link'
import { ProfileAvatar } from './profile-avatar'
import LogoutButton from './logout-button'
import { useDirtyState } from './dirty-state-provider'
import { useRouter } from 'next/navigation'

interface NavAvatarClientProps {
  avatarUrl: string
  name: string | null
  email: string | null
  isPro: boolean
}

export function NavAvatarClient({ avatarUrl, name, email, isPro }: NavAvatarClientProps) {
  const { confirmNavigation } = useDirtyState()
  const router = useRouter()

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault()
    confirmNavigation(() => router.push(href))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative group gap-2 px-3 py-2 hover:bg-foreground/5 rounded-full transition-all duration-300 hover:scale-105"
        >
          <div className="relative">
            <ProfileAvatar
              avatarUrl={avatarUrl}
              name={name}
              email={email}
              size={36}
            />
            {isPro && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-background ring-offset-0">
                <span className="sr-only">Pro</span>
              </span>
            )}
          </div>
          <span className="hidden sm:inline text-sm font-medium text-gray-200">
            {name}
          </span>
          {isPro && (
            <span className="hidden lg:inline-flex items-center rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-500 ring-1 ring-inset ring-emerald-500/20">
              PRO
            </span>
          )}
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center gap-2 p-3 border-b border-border/50 bg-muted/20">
          <ProfileAvatar
            avatarUrl={avatarUrl}
            name={name}
            email={email}
            size={36}
          />
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{name}</p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>
        </div>

        {isPro && (
          <div className="px-2 py-2">
            <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-500 shadow-sm border border-emerald-500/20">
              <Crown className="w-3.5 h-3.5" />
              PRO PLAN ACTIVE
            </div>
          </div>
        )}

        <DropdownMenuItem asChild>
          <Link
            href="/settings"
            onClick={(e) => handleLinkClick(e, '/settings')}
            className="flex items-center cursor-pointer mt-1"
          >
            <User className="w-4 h-4 mr-2" />
            Profile Settings
          </Link>
        </DropdownMenuItem>

        {/* <DropdownMenuItem asChild>
          <Link
            href="/analysis"
            onClick={(e) => handleLinkClick(e, '/analysis')}
            className="flex items-center cursor-pointer mt-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Recent Analyses
          </Link>
        </DropdownMenuItem> */}

        <DropdownMenuItem asChild>
          <Link
            href="/billing"
            onClick={(e) => handleLinkClick(e, '/billing')}
            className="flex items-center cursor-pointer"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Billing
          </Link>
        </DropdownMenuItem>



        <DropdownMenuSeparator />

        <LogoutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}