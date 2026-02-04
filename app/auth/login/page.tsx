"use client"

import GoogleLoginButton from "@/components/google-login-button"
import Logo from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth/auth-client"
import { Loader2, Target, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

type FormValues = {
  email: string,
  password: string,
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
          password: data.password
        },
        {
          onSuccess: () => {
            toast.success("Login Successful");
            window.location.href = '/dashboard'
          },
          onError: (ctx) => {
            console.log(ctx.error.message)
            toast.error(ctx.error.message);
            setIsLoading(false);
            throw new Error(ctx.error.message);
          },
        }
      );
    } catch {
      console.error(Error);
    }
  };

  const handleGoogleClick = () => {
    setIsLoading(true);
  };

  return (
    <div className="h-[calc(100vh-5rem)] premium-bg overflow-hidden neural-bg font-sans selection:bg-primary/30 relative flex items-center justify-center px-4">
      <div className="hero-orb opacity-50 scale-75" />
      <div className="scanlines" />

      {/* Particles */}
      <div className="particle" style={{ left: "10%", animationDelay: "0s" }} />
      <div className="particle" style={{ left: "80%", animationDelay: "2s" }} />

      <div className="w-full max-w-md text-primary relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="pt-4 w-14 h-14 rounded-lg bg-primary/20 flex items-center justify-center shadow-[0_0_20px_rgba(100,255,218,0.3)] glass-glow">
            <Logo height={100} width={100} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">MAFS</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Multi-Agent Fight Simulator</p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="glass-card-intense border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
          <h2 className="text-2xl font-bold mb-2 text-white text-center">Sign in to MAFS</h2>
          <p className="text-sm text-gray-400 mb-6 text-center">Welcome back! Enter your credentials to continue.</p>

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
                className="glass-input bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-primary/50 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm text-gray-300">
                  Password
                </Label>
                <Link href="/auth/forgot-password" className="text-xs text-primary/80 hover:text-primary transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  className="glass-input bg-black/20 border-white/10 text-white placeholder:text-gray-600 pr-10 focus:border-primary/50 focus:ring-primary/20"
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

            <Button disabled={isLoading} className="w-full premium-button text-black font-bold h-11 text-base shadow-[0_0_20px_rgba(100,255,218,0.2)]">
              {isLoading && <Loader2 className="animate-spin size-4 mr-2" />}Log In
            </Button>
          </form>

          <div className="mt-4">
            <GoogleLoginButton disabled={isLoading} onClick={handleGoogleClick} />
          </div>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-400">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-white">Logging in...</p>
          </div>
        </div>
      )}
    </div>
  )
}
