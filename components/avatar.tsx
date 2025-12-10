"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Button } from './ui/button'
import { ChevronDown, CreditCard, LogOut, SettingsIcon, User } from 'lucide-react'
import Link from 'next/link'
import LogoutButton from './logout-button'
import { useSession } from '@/lib/auth/auth-client'
import { redirect, usePathname } from 'next/navigation'

const Avatar = () => {
  const { data, isPending } = useSession();
  const pathname = usePathname();
  if (!data?.user) {
    return (
      <Button onClick={() => redirect("/auth/login")}>
        Login
      </Button>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="gap-2 px-3 py-2 hover:bg-foreground/5 rounded-full transition-all duration-300 hover:scale-105"
          >
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-foreground text-sm font-bold shadow-lg shadow-purple-500/40 animate-glow-pulse">
              {data?.user.name.slice(0,1)}
            </div>
            <span className="hidden sm:inline text-sm font-medium text-gray-200">{data?.user.name}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>
            <Link className='flex' href={'/settings'}>
            <User className="w-4 h-4 mr-2" />
            Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link className='flex' href={"/billing"}>
            <CreditCard className="w-4 h-4 mr-2" />
            Billing
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link className='flex' href={'/settings'}>
            <SettingsIcon className="w-4 h-4 mr-2" />
            Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <LogoutButton />
        </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Avatar