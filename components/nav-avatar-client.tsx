// components/nav-avatar-client.tsx
"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Button } from './ui/button'
import { ChevronDown, CreditCard, SettingsIcon, User } from 'lucide-react'
import Link from 'next/link'
import { ProfileAvatar } from './profile-avatar'
import LogoutButton from './logout-button'

interface NavAvatarClientProps {
  avatarUrl: string
  name: string | null
  email: string | null
}

export function NavAvatarClient({ avatarUrl, name, email }: NavAvatarClientProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="gap-2 px-3 py-2 hover:bg-foreground/5 rounded-full transition-all duration-300 hover:scale-105"
        >
          <ProfileAvatar 
            avatarUrl={avatarUrl} 
            name={name} 
            email={email} 
            size={36} 
          />
          <span className="hidden sm:inline text-sm font-medium text-gray-200">
            {name}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center cursor-pointer">
            <User className="w-4 h-4 mr-2" />
            Profile
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/billing" className="flex items-center cursor-pointer">
            <CreditCard className="w-4 h-4 mr-2" />
            Billing
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/analysis" className="flex items-center cursor-pointer">
            <CreditCard className="w-4 h-4 mr-2" />
            My Runs
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <LogoutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}