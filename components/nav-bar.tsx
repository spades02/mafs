import { headers } from 'next/headers'
import NavAvatar from "./nav-avatar"
import { NavBarClient } from './nav-bar-client'
import { auth } from '@/app/lib/auth/auth'
import { db } from "@/db"
import { user as userSchema } from "@/db/schema"
import { eq } from "drizzle-orm"

export default async function NavBar() {
  const nextHeaders = await headers();
  const authHeaders = new Headers(nextHeaders);
  // Get session to determine which nav items to show
  const session = await auth.api.getSession({
    headers: authHeaders
  });

  let analysisCount = 0;
  if (session?.user?.id) {
    const dbUser = await db.query.user.findFirst({
      where: eq(userSchema.id, session.user.id),
      columns: {
        analysisCount: true
      }
    });
    analysisCount = dbUser?.analysisCount ?? 0;
  }

  return (
    <NavBarClient
      isAuthenticated={!!session?.user}
      isPro={session?.user?.isPro || false}
      analysisCount={analysisCount}
    >
      <NavAvatar session={session} isPro={session?.user?.isPro || false} />
    </NavBarClient>
  )
}