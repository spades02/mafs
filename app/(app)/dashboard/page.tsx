import { getFutureEvents } from "./actions"
import DashboardClient from "./dashboard-client"
import { auth } from "@/app/lib/auth/auth"
import { headers } from "next/headers"
import { db } from "@/db"
import { user } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getThresholds } from "@/lib/calibration/thresholds"

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  let oddsFormat = "american"
  let pushOptIn = true

  if (session?.user?.id) {
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
      columns: {
        oddsFormat: true,
        pushNotificationsOptIn: true,
      }
    })
    if (dbUser?.oddsFormat) {
      oddsFormat = dbUser.oddsFormat
    }
    if (typeof dbUser?.pushNotificationsOptIn === "boolean") {
      pushOptIn = dbUser.pushNotificationsOptIn
    }
  }

  const futureEvents = await getFutureEvents()
  const thresholds = await getThresholds()

  return <DashboardClient initialEvents={futureEvents} userOddsFormat={oddsFormat} thresholds={thresholds} pushOptIn={pushOptIn} />
}
