"use client"

import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { authClient } from "@/lib/auth/auth-client"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"

function ResetPasswordContent() {
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()

    const token = searchParams.get("token")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const password = formData.get("password") as string
        const confirmPassword = formData.get("confirmPassword") as string

        if (!token) {
            toast.error("Invalid link: Missing reset token")
            setLoading(false)
            return
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            setLoading(false)
            return
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters")
            setLoading(false)
            return
        }

        try {
            await authClient.resetPassword({
                newPassword: password,
                token
            }, {
                onRequest: () => {
                    setLoading(true)
                },
                onSuccess: () => {
                    toast.success("Password reset successfully")
                    router.push("/auth/login")
                },
                onError: (ctx) => {
                    toast.error(ctx.error.message || "Failed to reset password")
                    setLoading(false)
                },
            })
        } catch (error) {
            setLoading(false)
            toast.error("Something went wrong")
        }
    }

    return (
        <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-primary/10 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-2">Set new password</h2>
            <p className="text-sm mb-6">Create a strong password for your account.</p>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm">
                        New Password
                    </Label>
                    <div className="relative">
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            className="bg-foreground/5 border-foreground/10 text-foreground placeholder:text-gray-500 pr-10"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm">
                        Confirm Password
                    </Label>
                    <div className="relative">
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            className="bg-foreground/5 border-foreground/10 text-foreground placeholder:text-gray-500 pr-10"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-linear-to-r from-primary/20 to-primary/40 hover:from-primary/40 hover:to-primary/60 text-gray-200 font-medium"
                >
                    {loading ? "Resetting..." : "Reset Password"}
                </Button>
            </form>

            <div className="mt-6">
                <button
                    onClick={async () => { await authClient.signOut(); }}
                    className="flex items-center justify-center gap-2 text-sm text-blue-400 hover:text-blue-300 w-full"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to login
                </button>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center px-4 bg-digital-noise">
            <div className="w-full max-w-md text-primary">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center shadow-lg shadow-primary/30">
                        <Lock className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">MAFS</h1>
                        <p className="text-xs">Multi-Agent Fight Simulator</p>
                    </div>
                </div>

                <Suspense fallback={<div>Loading...</div>}>
                    <ResetPasswordContent />
                </Suspense>
            </div>
        </div>
    )
}
