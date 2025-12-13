import React from 'react'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Bell } from 'lucide-react'
import { Switch } from './ui/switch'
import { Button } from './ui/button'

const UserPreferences = () => {
  return (
    <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-foreground/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-foreground">Preferences</h2>
          </div>

          <div className="grid gap-6 max-w-2xl">
            <div>
              <Label htmlFor="timezone" className="text-sm text-gray-300 mb-2">
                Time Zone
              </Label>
              <Select>
                <SelectTrigger className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-lg text-foreground">
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
                    className="px-4 py-2 bg-foreground/5 border border-foreground/10 rounded-lg text-sm text-gray-300 hover:bg-foreground/10 hover:text-foreground transition-colors"
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
                className="bg-foreground/5 border-foreground/10 text-foreground"
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-foreground/10">
              <h3 className="text-sm font-medium text-gray-300">Notifications</h3>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Email alerts for new cards</p>
                  <p className="text-xs text-gray-400">Get notified when new fight cards are available</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Risk warnings</p>
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
)
}

export default UserPreferences