
import { headers } from 'next/headers'
import NavAvatar from "./nav-avatar"
import { NavBarClient } from './nav-bar-client'
import { auth } from '@/lib/auth/auth'

export default async function NavBar() {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || '/'
  
  // Get session to determine which nav items to show
  const session = await auth.api.getSession({
    headers: headersList
  });
  
  const isAuthenticated = !!session?.user
  
  return (
    <NavBarClient pathname={pathname} isAuthenticated={isAuthenticated}>
      <NavAvatar />
    </NavBarClient>
  )
}