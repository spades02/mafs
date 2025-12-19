'use client'

import { Upload, User } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { updateProfile } from "@/app/actions/update-profile"
import { Dialog, DialogContent, DialogClose, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog"
import { ProfileAvatar } from "./profile-avatar"
import { AvatarUpload } from "./avatar-upload"
import { useState } from "react"
import { toast } from "sonner"

interface ProfileSettingsProps {
  user: { 
    id: string 
    createdAt: Date 
    updatedAt: Date 
    email: string 
    emailVerified: boolean 
    name: string 
    image?: string | null | undefined 
  } | undefined
  avatarUrl: string | null
}

const ProfileSettings = ({ user, avatarUrl }: ProfileSettingsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')

  const handleSubmit = async () => {
    setIsSubmitting(true)

    const formData = new FormData()
    formData.append('name', name)
    formData.append('email', email)
    
    // Get avatar file from AvatarUpload component if it exists
    const avatarInput = document.querySelector('input[name="avatar"]') as HTMLInputElement
    if (avatarInput?.files?.[0]) {
      formData.append('avatar', avatarInput.files[0])
    }
    
    try {
      const result = await updateProfile(formData)
      
      if (result.success) {
        toast.success("Profile updated successfully!")
      } else {
        toast.error('Failed to update profile')
      }
    } catch (error:any) {
      toast.error('Failed to update profile', error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-primary/10 text-primary rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Profile</h2>
      </div>

      <div className="place-self-center grid gap-6 w-md">

        <div className="grid gap-4">
          <div className="grid gap-3">
            <AvatarUpload
              currentAvatarUrl={avatarUrl}
              name={typeof user?.name === "string" ? user.name : ""}
              email={typeof user?.email === "string" ? user.email : ""}
            />
          </div>
        </div>

        <div className="grid gap-4">
          <div>
            <Label htmlFor="name" className="text-sm mb-2">
              Name
            </Label>
            <Input 
              id="name" 
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-foreground/5 border-foreground/10 text-foreground" 
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm mb-2">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-foreground/5 border-foreground/10 text-foreground"
              required
            />
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-linear-to-r from-primary/20 to-primary/40 hover:from-primary/40 hover:to-primary/60 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="border-foreground/10 hover:bg-foreground/5 bg-transparent hover:text-primary/40"
            >
              Change Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileSettings