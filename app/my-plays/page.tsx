
import AllPlaysTable from "@/components/all-plays-table"
import MyPlaysGrid from "@/components/my-plays-grid"

export default function MyPlaysPage() {
  return (
    <main className="container mx-auto px-6 py-12 max-w-[1600px]">
      <h1 className="text-3xl font-bold mb-8">My Plays</h1>
      <MyPlaysGrid />
      <AllPlaysTable />
    </main>
  )
}
