import ProfileSettings from "@/components/profile-settings"
import UserPreferences from "@/components/user-preferences"

export default function SettingsPage() {
  return (
    <main className="container mx-auto px-6 py-12 max-w-[1200px]">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

      <div className="grid gap-8">
        {/* Profile Settings */}
        <ProfileSettings  />

        {/* Preferences */}
        <UserPreferences />
      </div>
    </main>
  )
}
