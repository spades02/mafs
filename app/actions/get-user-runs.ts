'use server'

import { auth } from "@/app/lib/auth/auth"
import { headers } from "next/headers"
import { db } from "@/db/db"
import { analysisRun } from "@/db/schema/analysis-run"
import { eq, desc } from "drizzle-orm"

export async function getUserRuns() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session?.user) return []

        const runs = await db.select({
            id: analysisRun.id,
            title: analysisRun.title,
            createdAt: analysisRun.createdAt
        })
            .from(analysisRun)
            .where(eq(analysisRun.userId, session.user.id))
            .orderBy(desc(analysisRun.createdAt))
            .limit(20)

        return runs
    } catch (error) {
        console.error("Failed to fetch runs:", error)
        return []
    }
}
