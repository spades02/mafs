'use client'


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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "./ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { changePassword } from "@/lib/auth/auth-client"

interface ProfileSettingsProps {
  user: {
    id: string
    createdAt: Date
    updatedAt: Date
    email: string
    emailVerified: boolean
    name: string | null
    image?: string | null
    timeZone?: string | null
    oddsFormat?: string | null
    emailAlerts?: boolean | null
    riskWarnings?: boolean | null
    passwordHash?: string | null
  } | undefined
  avatarUrl: string | null
}

// ...



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

  // Preferences State
  const [timeZone, setTimeZone] = useState(user?.timeZone || 'America/New_York (EST)')
  const [oddsFormat, setOddsFormat] = useState(user?.oddsFormat || 'american')
  const [emailAlerts, setEmailAlerts] = useState(user?.emailAlerts ?? true)
  const [riskWarnings, setRiskWarnings] = useState(user?.riskWarnings ?? true)

  // Password State
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setPasswordLoading(true)
    try {
      await changePassword({
        newPassword: newPassword,
        currentPassword: currentPassword,
        revokeOtherSessions: true,
      }, {
        onSuccess: () => {
          toast.success("Password changed successfully")
          setChangePasswordOpen(false)
          setCurrentPassword("")
          setNewPassword("")
          setConfirmPassword("")
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Failed to change password")
        }
      })
    } catch (err) {
      toast.error("An unexpected error occurred")
    } finally {
      setPasswordLoading(false)
    }
  }

  // Error State
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})

  // Calculate if changes exist by comparing current state to initial props
  const hasChanges = useMemo(() => {
    const initialName = user?.name || ''
    const initialEmail = user?.email || ''
    const initialTimeZone = user?.timeZone || 'America/New_York (EST)'
    const initialOddsFormat = user?.oddsFormat || 'american'
    const initialEmailAlerts = user?.emailAlerts ?? true
    const initialRiskWarnings = user?.riskWarnings ?? true

    const isNameChanged = name.trim() !== initialName
    const isEmailChanged = email.trim() !== initialEmail
    const isTimeZoneChanged = timeZone !== initialTimeZone
    const isOddsFormatChanged = oddsFormat !== initialOddsFormat
    const isEmailAlertsChanged = emailAlerts !== initialEmailAlerts
    const isRiskWarningsChanged = riskWarnings !== initialRiskWarnings

    return isNameChanged || isEmailChanged || avatarHasChanged || isTimeZoneChanged || isOddsFormatChanged || isEmailAlertsChanged || isRiskWarningsChanged
  }, [name, email, avatarHasChanged, user, timeZone, oddsFormat, emailAlerts, riskWarnings])

  // Sync dirty state
  useEffect(() => {
    setIsDirty(hasChanges)
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
    formData.append('timeZone', timeZone)
    formData.append('oddsFormat', oddsFormat)
    formData.append('emailAlerts', String(emailAlerts))
    formData.append('riskWarnings', String(riskWarnings))

    if (removeAvatar) {
      formData.append('removeAvatar', 'true')
    }

    if (avatarBlob) {
      const file = new File([avatarBlob], "avatar.jpg", { type: "image/jpeg" })
      formData.append('avatar', file)
    } else if (!removeAvatar) {
      const avatarInput = document.querySelector('input[name="avatar"]') as HTMLInputElement
      if (avatarInput?.files?.[0]) {
        formData.append('avatar', avatarInput.files[0])
      }
    }

    try {
      const result = await updateProfile(formData)

      if (result.success) {
        toast.success("Profile updated successfully!")
        setAvatarHasChanged(false)
        setAvatarBlob(null)
        setRemoveAvatar(false)
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
    <div className="grid gap-6">

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="mb-4">
            <AvatarUpload
              currentAvatarUrl={removeAvatar ? null : avatarUrl}
              name={typeof user?.name === "string" ? user.name : ""}
              email={typeof user?.email === "string" ? user.email : ""}
              onAvatarChange={handleAvatarChange}
              onRemove={handleRemoveAvatar}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="name" className={cn("text-sm font-medium mb-2 block", errors.name && "text-destructive")}>Name</Label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={handleNameChange}
              className={cn(
                "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm",
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
            <Label htmlFor="email" className={cn("text-sm font-medium mb-2 block", errors.email && "text-destructive")}>Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              className={cn(
                "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm",
                errors.email && "border-destructive focus-visible:ring-destructive"
              )}
              required
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-xs text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            {user?.passwordHash && (
              <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Change Password</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                      Enter your current password and a new password to update your credentials.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>Cancel</Button>
                    <Button onClick={handleChangePassword} disabled={passwordLoading}>
                      {passwordLoading ? "Updating..." : "Update Password"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium">Time Zone</label>
            <select
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm h-10"
            >
              <option value="America/New_York (EST)">America/New_York (EST)</option>
              <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST)</option>
              <option value="America/Chicago (CST)">America/Chicago (CST)</option>
              <option value="Europe/London (GMT)">Europe/London (GMT)</option>
            </select>
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium">Odds Format</label>
            <div className="flex gap-2">
              <Button
                variant={oddsFormat === "american" ? "default" : "outline"}
                onClick={() => setOddsFormat("american")}
                className={cn("w-1/2", oddsFormat === "american" ? "bg-primary text-primary-foreground" : "")}
              >
                American
              </Button>
              <Button
                variant={oddsFormat === "decimal" ? "default" : "outline"}
                onClick={() => setOddsFormat("decimal")}
                className={cn("w-1/2", oddsFormat === "decimal" ? "bg-primary text-primary-foreground" : "")}
              >
                Decimal
              </Button>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-alerts">Email alerts for new events</Label>
                <p className="text-sm text-muted-foreground">Get notified when new UFC events are available for analysis</p>
              </div>
              <Switch id="email-alerts" checked={emailAlerts ?? true} onCheckedChange={setEmailAlerts} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="risk-warnings">Variance warnings</Label>
                <p className="text-sm text-muted-foreground">Alert when simulations show high outcome uncertainty</p>
              </div>
              <Switch id="risk-warnings" checked={riskWarnings ?? true} onCheckedChange={setRiskWarnings} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !hasChanges}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {isSubmitting ? 'Saving...' : 'Save Preferences'}
      </Button>

      {/* Legal Section */}
      <Card className="mt-0">
        <CardHeader>
          <CardTitle>Legal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <button onClick={() => toast.info("Terms of Use coming soon")} className="w-full text-left px-4 py-3 rounded-lg border border-input bg-background hover:bg-muted/50 transition-colors">
              <span className="text-sm font-medium">Terms of Use</span>
            </button>
            <button onClick={() => toast.info("Privacy Policy coming soon")} className="w-full text-left px-4 py-3 rounded-lg border border-input bg-background hover:bg-muted/50 transition-colors">
              <span className="text-sm font-medium">Privacy Policy</span>
            </button>
          </div>

          <div className="pt-4 border-t border-input">
            <h4 className="text-sm font-medium mb-3">Analytics Disclaimer</h4>
            <div className="px-4 py-3 rounded-lg bg-muted/30 border border-white/5">
              <p className="text-xs text-muted-foreground leading-relaxed">
                MAFS does not facilitate or enable gambling. The app provides analytical simulations and statistical
                insights intended for educational and entertainment purposes only. Users are solely responsible for
                any decisions they make outside the app.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs text-muted-foreground/60">
              All simulations are hypothetical and based on historical data. Past performance does not guarantee future results.
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}

export default ProfileSettings