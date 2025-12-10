import HistoryTable from "@/components/history-table"

export default function HistoryPage() {
  return (
    <main className="container mx-auto px-6 py-12 max-w-[1600px]">
      <h1 className="text-3xl font-bold text-foreground mb-8">History</h1>
      <HistoryTable />
    </main>
  )
}
