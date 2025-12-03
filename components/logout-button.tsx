"use client"
import { DropdownMenuItem } from './ui/dropdown-menu'
import { LogOut } from 'lucide-react'
import { authClient } from '@/lib/auth/auth-client'
import { redirect } from 'next/navigation'
import { toast } from 'sonner'

function LogoutButton() {
    const handleLogout = async() =>{
        await authClient.signOut({
            fetchOptions:{
                onSuccess:() =>{
                    toast.success("Logged out successfully!")
                    redirect("/auth/login")
                }
            }
        })
    }
  return (
    <DropdownMenuItem onSelect={handleLogout} className="text-red-400">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </DropdownMenuItem>
  )
}

export default LogoutButton