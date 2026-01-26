import { getFutureEvents } from "./actions"
import DashboardClient from "./dashboard-client"

export default async function DashboardPage() {
  const futureEvents = await getFutureEvents()

  return <DashboardClient initialEvents={futureEvents} />
}
