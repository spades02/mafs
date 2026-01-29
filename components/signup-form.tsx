"use client"
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import Link from 'next/link'
import { useState } from 'react';
import { authClient } from '@/lib/auth/auth-client'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import GoogleLoginButton from './google-login-button'


type FormValues = {
  name: string,
  email: string,
  password: string,
  confirmPassword?: string
}

function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // prevent reload

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    const data: FormValues = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: password,
      confirmPassword: confirmPassword,
    };

    if (!data.email || !data.password) {
      toast.error("Email and password are required.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      await authClient.signUp.email(
        {
          email: data.email,
          name: data.name,
          password: data.password
        },
        {
          autoSignIn: true,
          onSuccess: () => {
            // Better Auth handles the session creation automatically with autoSignIn
            toast.success("Account created successfully");
            window.location.href = "/dashboard";
          },
          onError: (ctx) => {
            console.log("signup error", ctx)
            toast.error(ctx.error.message);
            setIsLoading(false);
          },
        }
      );
    } catch (error) {
      console.error(error)
      setIsLoading(false)
    }
  };
  const handleGoogleClick = () => {
    setIsLoading(true); // disable parent button when Google button is clicked
  };

  return (
    <div className="glass-card-intense border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
      <h2 className="text-2xl font-bold mb-2 text-white text-center">Create your MAFS account</h2>
      <p className="text-sm text-gray-400 mb-6 text-center">Start analyzing fights with AI-powered insights.</p>

      <form className="space-y-4" onSubmit={handleFormSubmit}>
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm text-gray-300">
            Name
          </Label>
          <Input
            id="name"
            name='name'
            type="text"
            placeholder="Alex Smith"
            className="glass-input bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-primary/50 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm text-gray-300">
            Email
          </Label>
          <Input
            id="email"
            name='email'
            type="email"
            placeholder="you@example.com"
            className="glass-input bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-primary/50 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm text-gray-300">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name='password'
              type={showPassword ? "text" : "password"}
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm text-gray-300">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name='confirmPassword'
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              className="glass-input bg-black/20 border-white/10 text-white placeholder:text-gray-600 pr-10 focus:border-primary/50 focus:ring-primary/20"
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

        <Button disabled={isLoading} type='submit' className="w-full premium-button text-black font-bold h-11 text-base shadow-[0_0_20px_rgba(100,255,218,0.2)]">
          {isLoading && <Loader2 className='size-3 animate-spin mr-2' />}
          Create Account
        </Button>

      </form>

      <div className="mt-4">
        <GoogleLoginButton disabled={isLoading} onClick={handleGoogleClick} />
      </div>

      <p className="mt-6 text-center text-sm text-gray-400">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
          Log in
        </Link>
      </p>

      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-white">Creating account...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default SignupForm