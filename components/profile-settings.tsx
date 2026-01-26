'use client'

import { User } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { updateProfile } from "@/app/actions/update-profile"
import { AvatarUpload } from "./avatar-upload"
import { useState, useMemo, useEffect } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useDirtyState } from "./dirty-state-provider"

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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ProfileSettings = ({ user, avatarUrl }: ProfileSettingsProps) => {
  const router = useRouter()
  const { setIsDirty } = useDirtyState()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [avatarBlob, setAvatarBlob] = useState<Blob | null>(null)
  const [avatarHasChanged, setAvatarHasChanged] = useState(false)
  const [removeAvatar, setRemoveAvatar] = useState(false)

  // Error State
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})

  // Calculate if changes exist by comparing current state to initial props
  const hasChanges = useMemo(() => {
    const initialName = user?.name || ''
    const initialEmail = user?.email || ''

    const isNameChanged = name.trim() !== initialName
    const isEmailChanged = email.trim() !== initialEmail

    return isNameChanged || isEmailChanged || avatarHasChanged
  }, [name, email, avatarHasChanged, user])

  // Sync dirty state
  useEffect(() => {
    setIsDirty(hasChanges)

    // Cleanup on unmount
    return () => setIsDirty(false)
  }, [hasChanges, setIsDirty])

  const validateForm = () => {
    const newErrors: { name?: string; email?: string } = {}
    let isValid = true

    if (!name.trim()) {
      newErrors.name = "Name is required"
      isValid = false
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
      isValid = false
    }

    if (!email.trim()) {
      newErrors.email = "Email is required"
      isValid = false
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = "Please enter a valid email address"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleAvatarChange = (blob: Blob) => {
    setRemoveAvatar(false)
    setAvatarBlob(blob)
    setAvatarHasChanged(true)
  }

  const handleRemoveAvatar = () => {
    setRemoveAvatar(true)
    setAvatarBlob(null)
    setAvatarHasChanged(true)
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please check your inputs")
      return
    }

    setIsSubmitting(true)

    const formData = new FormData()
    formData.append('name', name)
    formData.append('email', email)
    if (removeAvatar) {
      formData.append('removeAvatar', 'true')
    }

    // Use the cropped blob if available, otherwise check the file input
    if (avatarBlob) {
      const file = new File([avatarBlob], "avatar.jpg", { type: "image/jpeg" })
      formData.append('avatar', file)
    } else if (!removeAvatar) {
      // Only check file input if we are NOT removing.
      // Although avatarBlob should be null if removing, just extra safety.
      const avatarInput = document.querySelector('input[name="avatar"]') as HTMLInputElement
      if (avatarInput?.files?.[0]) {
        formData.append('avatar', avatarInput.files[0])
      }
    }

    try {
      const result = await updateProfile(formData)

      if (result.success) {
        toast.success("Profile updated successfully!")
        // Reset the avatar change tracker
        setAvatarHasChanged(false)
        setAvatarBlob(null)
        setRemoveAvatar(false)

        // Refresh the page to update the nav-avatar and other components
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to update profile')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      toast.error('Failed to update profile', { description: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }))
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }))
  }

  return (
    <div className="w-full bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-primary/10 text-primary rounded-2xl p-8 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Profile</h2>
      </div>

      <div className="grid gap-8 w-full max-w-lg mx-auto">

        {/* Avatar Upload with Cropper */}
        <div className="grid gap-4">
          <div className="grid gap-3">
            <AvatarUpload
              currentAvatarUrl={removeAvatar ? null : avatarUrl}
              name={typeof user?.name === "string" ? user.name : ""}
              email={typeof user?.email === "string" ? user.email : ""}
              onAvatarChange={handleAvatarChange}
              onRemove={handleRemoveAvatar}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="grid gap-4">
          <div>
            <Label htmlFor="name" className={cn("text-sm mb-2", errors.name && "text-destructive")}>
              Name
            </Label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={handleNameChange}
              className={cn(
                "bg-foreground/5 border-foreground/10 text-foreground",
                errors.name && "border-destructive focus-visible:ring-destructive"
              )}
              required
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-xs text-destructive mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email" className={cn("text-sm mb-2", errors.email && "text-destructive")}>
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              className={cn(
                "bg-foreground/5 border-foreground/10 text-foreground",
                errors.email && "border-destructive focus-visible:ring-destructive"
              )}
              required
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-xs text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !hasChanges}
              className="bg-linear-to-r from-primary/20 to-primary/40 hover:from-primary/40 hover:to-primary/60 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileSettings