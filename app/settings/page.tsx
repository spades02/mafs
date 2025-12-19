import ProfileSettings from "@/components/profile-settings"
import UserPreferences from "@/components/user-preferences"
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export default async function SettingsPage() {
  const h = await headers();
  const session = await auth.api.getSession({
    headers: Object.fromEntries(h.entries()),
  });
  if(!session){
    throw new Error("Unauthorized")
  }
  const user = session?.user;

  const avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${user.image}?v=${user.updatedAt}`
  return (
    <main className="container mx-auto px-6 py-12 max-w-[1600px]">
      <h1 className="text-3xl font-bold text-foreground mb-8">Settings</h1>

      <div className="grid gap-8 place-items-center">
        {/* Profile Settings */}
        <ProfileSettings user={user} avatarUrl={avatarUrl} />

        {/* Preferences */}
        {/* <UserPreferences /> */}
      </div>
    </main>
  )
}
