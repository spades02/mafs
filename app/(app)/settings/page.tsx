import ProfileSettings from "@/components/profile-settings"
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


        </div>
      </main>
    </div>
  )
}
