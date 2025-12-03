"use client"
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import Link from 'next/link'
import { useState } from 'react';
import { authClient } from '@/lib/auth/auth-client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import GoogleLoginButton from './google-login-button'

type FormValues = {
  name: string,
  email: string,
  password: string,
}

function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // prevent reload

    const formData = new FormData(e.currentTarget);

    const data: FormValues = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    if (!data.email || !data.password) {
      toast.error("Email and password are required.");
      return;
    }

    try {
      setIsLoading(true);

      await authClient.signUp.email(
        {
          email: data.email,
          name: data.name,
          password: data.password,
          callbackURL: "/"
        },
        {
          onSuccess: () => {
            toast.success("Account created successfully");
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
    setIsLoading(true); // disable parent button when Google button is clicked
  };
  
  return (
    <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-white/10 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">Create your MAFS account</h2>
            <p className="text-sm text-gray-400 mb-6">Start analyzing fights with AI-powered insights.</p>

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
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
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
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-gray-300">
                  Password
                </Label>
                <Input
                  id="password"
                  name='password'
                  type="password"
                  placeholder="••••••••"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>

              <Button disabled={isLoading} type='submit' className="w-full bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium">
                {isLoading && <Loader2 className='size-3 animate-spin' />}
                Create Account
              </Button>

            </form>
            <GoogleLoginButton disabled={isLoading} onClick={handleGoogleClick} />

            <p className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium">
                Log in
              </Link>
            </p>
          </div>
  )
}

export default SignupForm