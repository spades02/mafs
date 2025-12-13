import { User } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

const ProfileSettings = () => {
  return (
    <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-foreground/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-foreground">Profile</h2>
          </div>

          <div className="grid gap-6 max-w-2xl">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-foreground text-2xl font-bold">
                A
              </div>
              <div className="flex-1">
                <Button variant="outline" size="sm" className="border-foreground/10 hover:bg-foreground/5 bg-transparent">
                  Change Avatar
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="name" className="text-sm text-gray-300 mb-2">
                  Name
                </Label>
                <Input id="name" defaultValue="Alex Smith" className="bg-foreground/5 border-foreground/10 text-foreground" />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm text-gray-300 mb-2">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="alex@example.com"
                  className="bg-foreground/5 border-foreground/10 text-foreground"
                />
              </div>

              <div className="flex gap-3">
                <Button className="bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                  Save Changes
                </Button>
                <Button variant="outline" className="border-foreground/10 hover:bg-foreground/5 bg-transparent">
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        </div>
)
}

export default ProfileSettings