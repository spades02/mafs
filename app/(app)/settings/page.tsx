import ProfileSettings from "@/components/profile-settings"
import { SupportModal } from "@/components/support/support-modal";
import { auth } from "@/app/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { user as userSchema } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function SettingsPage() {
  const h = await headers();
  const session = await auth.api.getSession({
    headers: Object.fromEntries(h.entries()),
  });
  if (!session) {
    throw new Error("Unauthorized")
  }


  const dbUser = await db.query.user.findFirst({
    where: eq(userSchema.id, session.user.id),
  });

  const rawUser = dbUser || session.user;

  // Normalize user for ProfileSettings
  const user = {
    ...rawUser,
    name: rawUser.name || "",
    image: rawUser.image || null,
    passwordHash: 'passwordHash' in rawUser ? rawUser.passwordHash : null
  };

  const avatarUrl = user.image
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${user.image}?v=${user.updatedAt}`
    : null
  return (
    <div className="min-h-screen">
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Settings</h1>

        <div className="grid gap-8">
          {/* Profile Settings */}
          <ProfileSettings user={user} avatarUrl={avatarUrl} />

          {/* Support & Feedback */}
          <section className="rounded-lg border border-border/50 bg-[#0F1117] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">Support & feedback</h2>
            <p className="text-sm text-muted-foreground/70 mb-4">
              Need help, found a bug, or have an idea? Let us know.
            </p>
            <div className="flex flex-wrap gap-2">
              <SupportModal defaultType="support" />
              <SupportModal defaultType="bug" triggerVariant="ghost" />
              <SupportModal defaultType="feature_request" triggerVariant="ghost" />
              <SupportModal defaultType="feedback" triggerVariant="ghost" />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
