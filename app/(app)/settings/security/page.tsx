import { ChangePasswordForm } from "@/components/change-password-form"
import { auth } from "@/app/lib/auth/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { db } from "@/db"
import { user as userSchema } from "@/db/schema"
import { eq } from "drizzle-orm"

export default async function SecuritySettingsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect("/auth/login")
    }

    const dbUser = await db.query.user.findFirst({
        where: eq(userSchema.id, session.user.id),
        columns: {
            passwordHash: true
        }
    });

    return (
        <div className="min-h-screen">
            <main className="container mx-auto max-w-2xl px-4 py-8">
                <h1 className="text-3xl font-bold text-foreground mb-8">Security Settings</h1>

                <div className="grid gap-8">
                    <ChangePasswordForm hasPassword={!!dbUser?.passwordHash} />
                </div>
            </main>
        </div>
    )
}
