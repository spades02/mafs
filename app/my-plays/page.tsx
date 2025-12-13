import SummaryStrip from "@/components/pages/my-plays/summary-strip"
import PlaysTable from "@/components/pages/my-plays/plays-table"

export default function PlaysPage() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">My Plays</h1>

        {/* Summary Strip */}
        <SummaryStrip />

        {/* Plays Table */}
        <PlaysTable />
      </main>
    </div>
  )
}
