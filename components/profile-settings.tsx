'use client'

import { User } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { updateProfile } from "@/app/actions/update-profile"
import { AvatarUpload } from "./avatar-upload"
import { useState, useMemo } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form State
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [avatarHasChanged, setAvatarHasChanged] = useState(false)
  
  // Error State
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})

  // 1. Calculate if changes exist by comparing current state to initial props
  // We use useMemo to avoid recalculating on every render, though cheap here.
  const hasChanges = useMemo(() => {
    const initialName = user?.name || ''
    const initialEmail = user?.email || ''
    
    const isNameChanged = name.trim() !== initialName
    const isEmailChanged = email.trim() !== initialEmail
    
    return isNameChanged || isEmailChanged || avatarHasChanged
  }, [name, email, avatarHasChanged, user])

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

  // 2. Detect file input changes via Event Bubbling
  // This captures the change event from the <input type="file"> inside AvatarUpload
  const handleAvatarChangeWrapper = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.type === 'file') {
      setAvatarHasChanged(true);
    }
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
    
    const avatarInput = document.querySelector('input[name="avatar"]') as HTMLInputElement
    if (avatarInput?.files?.[0]) {
      formData.append('avatar', avatarInput.files[0])
    }
    
    try {
      const result = await updateProfile(formData)
      
      if (result.success) {
        toast.success("Profile updated successfully!")
        // 3. Reset the avatar change tracker on success
        setAvatarHasChanged(false)
        // Ideally, the parent component should re-render with new 'user' props here
        // to reset the text comparisons, usually via router.refresh() in the server action
      } else {
        toast.error('Failed to update profile')
      }
    } catch (error:any) {
      toast.error('Failed to update profile', { description: error.message })
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
    <div className="max-w-2xl bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-primary/10 text-primary rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Profile</h2>
      </div>

      <div className="place-self-center grid gap-6 w-md">

        {/* Wrapped in a div to catch the file input 'change' event */}
        <div className="grid gap-4" onChange={handleAvatarChangeWrapper}>
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
            />
            {errors.email && (
              <p className="text-xs text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleSubmit}
              // 4. Disable if submitting OR no changes detected
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