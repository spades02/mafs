"use client"

import { DropdownMenuItem } from './ui/dropdown-menu'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { logoutAction } from '@/app/actions/logout'

function LogoutButton() {
    const handleLogout = async() => {
        try {
            await logoutAction();
            toast.success("Logged out successfully!");
            window.location.href = '/auth/login';
        } catch (error) {
            toast.error("Failed to logout");
        }
    }
  return (
    <DropdownMenuItem onSelect={handleLogout} className="text-red-400">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </DropdownMenuItem>
  )
}

export default LogoutButton