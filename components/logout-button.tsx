"use client"

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { DropdownMenuItem } from './ui/dropdown-menu'
import { LogOut, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { logoutAction } from '@/app/actions/logout'
import { useDirtyState } from './dirty-state-provider'

function LogoutButton() {
  const { confirmNavigation } = useDirtyState()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logoutAction();
      toast.success("Logged out successfully!");
      window.location.href = '/auth/login';
    } catch (error) {
      toast.error("Failed to logout");
      setIsLoggingOut(false)
    }
  }

  const onSelect = (e: Event) => {
    e.preventDefault()
    confirmNavigation(handleLogout)
  }

  return (
    <>
      <DropdownMenuItem onSelect={onSelect} className="text-red-400 cursor-pointer">
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </DropdownMenuItem>
      {isLoggingOut && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-white">Logging out...</p>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default LogoutButton