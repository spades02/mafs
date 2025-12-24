import { DropdownMenuItem } from './ui/dropdown-menu'
import { LogOut } from 'lucide-react'
import { authClient } from '@/lib/auth/auth-client'
import { redirect } from 'next/navigation'
import { toast } from 'sonner'
import { logoutAction } from '@/app/actions/logout'

function LogoutButton() {
    const handleLogout = async() => {
        try {
            await logoutAction();
            toast.success("Logged out successfully!");
            setTimeout(() => {
                window.location.href = '/auth/login';
            }, 500);
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