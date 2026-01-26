// components/nav-bar.tsx (Server Component)
import { headers } from 'next/headers'
import NavAvatar from "./nav-avatar"
import { NavBarClient } from './nav-bar-client'
import { auth } from '@/app/lib/auth/auth'

export default async function NavBar() {
  const nextHeaders = await headers();
  const authHeaders = new Headers(nextHeaders);
  // Get session to determine which nav items to show
  const session = await auth.api.getSession({
    headers: authHeaders
  });

  return (
    <NavBarClient isAuthenticated={!!session?.user} isPro={session?.user?.isPro || false}>
      <NavAvatar session={session} isPro={session?.user?.isPro || false} />
    </NavBarClient>
  )
}