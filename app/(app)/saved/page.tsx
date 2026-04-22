import { getSavedPlays } from "./actions"
import { auth } from "@/app/lib/auth/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Bookmark } from "lucide-react"
import { SavedPlaysList } from "@/components/pages/saved/saved-plays-list"

export const dynamic = "force-dynamic"

export default async function SavedPlaysPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/auth/login?redirect=/saved")

  const plays = await getSavedPlays()

  return (
    <div className="min-h-screen premium-bg neural-bg">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Saved Plays</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Your collection of high-edge opportunities. Track, analyze, and act when the time is right.
          </p>
        </div>

        {plays.length === 0 ? (
          <Card className="glass-card glass-shimmer border-dashed border-white/10">
            <CardContent className="p-10 text-center">
              <Bookmark className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-base font-medium text-muted-foreground mb-1">No saved plays yet</p>
              <p className="text-sm text-muted-foreground/70">
                Tap the bookmark on any bet card on your dashboard to save it here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <SavedPlaysList plays={plays} />
        )}
      </main>
    </div>
  )
}
