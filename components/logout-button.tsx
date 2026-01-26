"use client"

import { DropdownMenuItem } from './ui/dropdown-menu'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { logoutAction } from '@/app/actions/logout'
import { useDirtyState } from './dirty-state-provider'

function LogoutButton() {
  const { confirmNavigation } = useDirtyState()

  const handleLogout = async () => {
    try {
      await logoutAction();
      toast.success("Logged out successfully!");
      window.location.href = '/auth/login';
    } catch (error) {
      toast.error("Failed to logout");
    }
  }

  const onSelect = (e: Event) => {
    e.preventDefault()
    confirmNavigation(handleLogout)
  }

  return (
    <DropdownMenuItem onSelect={onSelect} className="text-red-400 cursor-pointer">
      <LogOut className="w-4 h-4 mr-2" />
      Logout
    </DropdownMenuItem>
  )
}

export default LogoutButton