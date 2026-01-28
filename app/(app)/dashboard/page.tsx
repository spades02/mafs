import { getFutureEvents } from "./actions"
import DashboardClient from "./dashboard-client"
import { auth } from "@/app/lib/auth/auth"
import { headers } from "next/headers"
import { db } from "@/db"
import { user } from "@/db/schema"
import { eq } from "drizzle-orm"

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  let oddsFormat = "american"

  if (session?.user?.id) {
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
      columns: {
        oddsFormat: true
      }
    })
    if (dbUser?.oddsFormat) {
      oddsFormat = dbUser.oddsFormat
    }
  }

  const futureEvents = await getFutureEvents()

  return <DashboardClient initialEvents={futureEvents} userOddsFormat={oddsFormat} />
}
