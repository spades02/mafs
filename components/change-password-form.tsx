"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { changePassword } from "@/lib/auth/auth-client"
import { toast } from "sonner"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { setPassword } from "@/app/actions/security"
import { useRouter } from "next/navigation"

interface ChangePasswordFormProps {
    hasPassword?: boolean
}

export function ChangePasswordForm({ hasPassword = true }: ChangePasswordFormProps) {
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [passwordLoading, setPasswordLoading] = useState(false)
    const router = useRouter()

    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const handleSubmit = async () => {
        if (hasPassword && !currentPassword) {
            toast.error("Please enter your current password")
            return
        }

        if (!newPassword || !confirmPassword) {
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
            if (hasPassword) {
                // Change Password Flow
                await changePassword({
                    newPassword: newPassword,
                    currentPassword: currentPassword,
                    revokeOtherSessions: true,
                }, {
                    onSuccess: () => {
                        toast.success("Password changed successfully")
                        setCurrentPassword("")
                        setNewPassword("")
                        setConfirmPassword("")
                        router.push("/dashboard")
                    },
                    onError: (ctx) => {
                        toast.error(ctx.error.message || "Failed to change password")
                    }
                })
            } else {
                // Set Password Flow (Server Action)
                const result = await setPassword(newPassword)
                if (result.success) {
                    toast.success("Password set successfully")
                    setNewPassword("")
                    setConfirmPassword("")
                    router.push("/dashboard")
                    router.refresh()
                } else {
                    toast.error(result.error || "Failed to set password")
                }
            }
        } catch (err) {
            toast.error("An unexpected error occurred")
        } finally {
            setPasswordLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{hasPassword ? "Manage Password" : "Create Password"}</CardTitle>
                <CardDescription>
                    {hasPassword
                        ? "Enter your current password and a new password to update your credentials."
                        : "Set a password for your account to enable email/password login in addition to Google."}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {hasPassword && (
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <div className="relative">
                            <Input
                                id="current-password"
                                type={showCurrentPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                        <Input
                            id="new-password"
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <div className="relative">
                        <Input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div className="pt-2">
                    <Button onClick={handleSubmit} disabled={passwordLoading}>
                        {passwordLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {hasPassword ? "Updating..." : "Setting Password..."}
                            </>
                        ) : (
                            hasPassword ? "Update Password" : "Set Password"
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
