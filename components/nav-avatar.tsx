// components/nav-avatar.tsx (Server Component)
export const dynamic = 'force-dynamic';

import { Button } from './ui/button'
import Link from 'next/link'
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { NavAvatarClient } from './nav-avatar-client'

const NavAvatar = async() => {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  // If no session, show login button
  if (!session?.user) {
    return (
      <Button asChild>
        <Link href="/auth/login">
          Login
        </Link>
      </Button>
    );
  }

  // Build avatar URL with cache busting
  const avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${session.user.image}?v=${session.user.updatedAt}`
  
  return (
    <NavAvatarClient 
      avatarUrl={avatarUrl}
      name={session.user.name}
      email={session.user.email}
    />
  )
}

export default NavAvatar