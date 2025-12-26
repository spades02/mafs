import { Button } from "./ui/button"
import Link from "next/link"
import { NavAvatarClient } from "./nav-avatar-client"

export default function NavAvatar({ session }: { session: any }) {
  if (!session?.user) {
    return (
      <Button asChild>
        <Link href="/auth/login">Login</Link>
      </Button>
    )
  }

  const avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${session.user.image}?v=${session.user.updatedAt}`

  return (
    <NavAvatarClient
      avatarUrl={avatarUrl}
      name={session.user.name}
      email={session.user.email}
    />
  )
}

