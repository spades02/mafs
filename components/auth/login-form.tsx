// app/auth/login/login-form.tsx
"use client"

import GoogleLoginButton from "@/components/google-login-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { loginAction } from "@/app/actions/login"
import { authClient } from "@/lib/auth/auth-client"

export function LoginForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const isLoading = isPending || isGoogleLoading

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await loginAction(formData)
      window.location.href = '/dashboard'
      if (result.error) {
        toast.error(result.error)
      }
    })
  }

  const handleGoogleClick = async () => {
    setIsGoogleLoading(true)
    try {
      await authClient.signIn.social({
        provider: "google",
      })
    } catch (error: any) {
      toast.error(error.message || "Failed to login with Google")
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-primary/10 rounded-2xl p-8 shadow-2xl">
      <h2 className="text-2xl font-bold mb-2">Sign in to MAFS</h2>
      <p className="text-sm text-gray-400 mb-6">Welcome back! Enter your credentials to continue.</p>

      <form className="space-y-4" onSubmit={handleFormSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            className="bg-foreground/5 border-foreground/10 text-foreground placeholder:text-gray-500"
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            className="bg-foreground/5 border-foreground/10 text-foreground placeholder:text-gray-500"
            required
            disabled={isLoading}
          />
        </div>

        <Button 
          disabled={isLoading} 
          className="w-full bg-linear-to-r from-primary to-primary/20 hover:from-primary/20 hover:to-primary/30 text-gray-200 font-medium"
          type="submit"
        >
          {isPending && <Loader2 className="animate-spin size-4 mr-2" />}
          Log In
        </Button>
      </form>

      <GoogleLoginButton disabled={isLoading} onClick={handleGoogleClick} />

      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-gray-400">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}