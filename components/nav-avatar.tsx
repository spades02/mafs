"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Button } from './ui/button'
import { ChevronDown, CreditCard, LogOut, SettingsIcon, User } from 'lucide-react'
import Link from 'next/link'
import LogoutButton from './logout-button'
import { useSession } from '@/lib/auth/auth-client'
import { redirect, usePathname } from 'next/navigation'
import Image from 'next/image'
import { ProfileAvatar } from './profile-avatar'

const NavAvatar = () => {
  const { data, isPending } = useSession();
  const avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data?.user.image}?v=${data?.user.updatedAt}`
  
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
            <ProfileAvatar avatarUrl={avatarUrl} name={data?.user.name} email={data?.user.email} size={36} />
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

export default NavAvatar