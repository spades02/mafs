import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { User, Bell } from "lucide-react"

export default function SettingsPage() {
  return (
    <main className="container mx-auto px-6 py-12 max-w-[1200px]">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

      <div className="grid gap-8">
        {/* Profile Settings */}
        <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Profile</h2>
          </div>

          <div className="grid gap-6 max-w-2xl">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                A
              </div>
              <div className="flex-1">
                <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5 bg-transparent">
                  Change Avatar
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="name" className="text-sm text-gray-300 mb-2">
                  Name
                </Label>
                <Input id="name" defaultValue="Alex Smith" className="bg-white/5 border-white/10 text-white" />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm text-gray-300 mb-2">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="alex@example.com"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="flex gap-3">
                <Button className="bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                  Save Changes
                </Button>
                <Button variant="outline" className="border-white/10 hover:bg-white/5 bg-transparent">
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Preferences</h2>
          </div>

          <div className="grid gap-6 max-w-2xl">
            <div>
              <Label htmlFor="timezone" className="text-sm text-gray-300 mb-2">
                Time Zone
              </Label>
              <Select>
                <SelectTrigger className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                  <SelectValue placeholder="UTC-5 (Eastern Time)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eastern">UTC-5 (Eastern Time)</SelectItem>
                              <SelectItem value="central">UTC-6 (Central Time)</SelectItem>
                              <SelectItem value="mountain">UTC-7 (Mountain Time)</SelectItem>
                              <SelectItem value="pacific">UTC-8 (Pacific Time)</SelectItem>
                </SelectContent>
            </Select>
            </div>

            <div>
              <Label className="text-sm text-gray-300 mb-3 block">Odds Format</Label>
              <div className="flex gap-3">
                {["American", "Decimal", "Fractional"].map((format) => (
                  <button
                    key={format}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="unit-size" className="text-sm text-gray-300 mb-2">
                Default Unit Size (% of bankroll)
              </Label>
              <Input
                id="unit-size"
                type="number"
                defaultValue="2"
                min="0.5"
                max="10"
                step="0.5"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="text-sm font-medium text-gray-300">Notifications</h3>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Email alerts for new cards</p>
                  <p className="text-xs text-gray-400">Get notified when new fight cards are available</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Risk warnings</p>
                  <p className="text-xs text-gray-400">Alerts for high-volatility plays</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            <Button className="bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
              Save Preferences
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
