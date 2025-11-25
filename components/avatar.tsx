
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Button } from './ui/button'
import { ChevronDown, CreditCard, LogOut, SettingsIcon, User } from 'lucide-react'
import Link from 'next/link'

const Avatar = () => {
  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="gap-2 px-3 py-2 hover:bg-white/5 rounded-full transition-all duration-300 hover:scale-105"
          >
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-purple-500/40 animate-glow-pulse">
              A
            </div>
            <span className="hidden sm:inline text-sm font-medium text-gray-200">Alex</span>
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
          <DropdownMenuItem className="text-red-400">
            <Link className='flex' href={'/settings'}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Avatar