import SummaryStripHistory from "@/components/pages/history/summary-strip-history"
import EventsList from "@/components/pages/history/events-list"

export default function HistoryPage() {

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">History</h1>

        {/* Summary Strip */}
        <SummaryStripHistory />

        {/* Events List */}
        <EventsList />
      </main>
    </div>
  )
}
