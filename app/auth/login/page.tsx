"use client"

import GoogleLoginButton from "@/components/google-login-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth/auth-client"
import { Loader2, Target } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

type FormValues = {
  email: string,
  password: string,
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // prevent reload

    const formData = new FormData(e.currentTarget);

    const data: FormValues = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    if (!data.email || !data.password) {
      toast.error("Email and password are required.");
      return;
    }

    try {
      setIsLoading(true);

      await authClient.signIn.email(
        {
          email: data.email,
          password: data.password,
          callbackURL: "/"
        },
        {
          onSuccess: () => {
            toast.success("Login Successful");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleClick = () => {
    setIsLoading(true);
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center px-4 bg-digital-noise">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Target className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">MAFS</h1>
            <p className="text-xs text-gray-400">Multi-Agent Fight Simulator</p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-2">Sign in to MAFS</h2>
          <p className="text-sm text-gray-400 mb-6">Welcome back! Enter your credentials to continue.</p>

          <form className="space-y-4" onSubmit={handleFormSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-gray-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            <Button disabled={isLoading} className="w-full bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium">
              {isLoading && <Loader2 className="animate-spin size-3"/>}Log In
            </Button>


          </form>
            <GoogleLoginButton disabled={isLoading} onClick={handleGoogleClick} />

          <div className="mt-6 text-center space-y-2">
            <Link href="/auth/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
              Forgot your password?
            </Link>
            <p className="text-sm text-gray-400">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
