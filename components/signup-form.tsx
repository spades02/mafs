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
import { useRouter } from "next/navigation";


type FormValues = {
  name: string,
  email: string,
  password: string,
}

function SignupForm() {
  const router = useRouter();
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
      console.log("before calling signup")
      await authClient.signUp.email(
        {
          email: data.email,
          name: data.name,
          password: data.password
        },
        {
          onSuccess: async () => {
            toast.success("Account created successfully");
            await authClient.signIn.email({
              email: data.email,
              password: data.password,
            },
            {
              onSuccess: () => {
                router.push("/dashboard")
              },
              onError: (ctx) => {
                console.log(ctx.error.message)
                toast.error(ctx.error.message);
              },
            });
          },
          onError: (ctx) => {
            console.log("after calling signup error")
            toast.error(ctx.error.message);
            setIsLoading(false);
            throw new Error(ctx.error.message);
          },
        }
      );
    } catch(error) {
      console.error(Error)
    }
  };
  const handleGoogleClick = () => {
    setIsLoading(true); // disable parent button when Google button is clicked
  };
  
  return (
    <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-foreground/10 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-primary mb-2">Create your MAFS account</h2>
            <p className="text-sm text-primary mb-6">Start analyzing fights with AI-powered insights.</p>

            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm text-primary">
                  Name
                </Label>
                <Input
                  id="name"
                  name='name'
                  type="text"
                  placeholder="Alex Smith"
                  className="bg-foreground/5 border-foreground/10 text-foreground placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-primary">
                  Email
                </Label>
                <Input
                  id="email"
                  name='email'
                  type="email"
                  placeholder="you@example.com"
                  className="bg-foreground/5 border-foreground/10 text-foreground placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-primary">
                  Password
                </Label>
                <Input
                  id="password"
                  name='password'
                  type="password"
                  placeholder="••••••••"
                  className="bg-foreground/5 border-foreground/10 text-foreground placeholder:text-gray-500"
                />
              </div>

              <Button disabled={isLoading} type='submit' className="w-full bg-linear-to-r from-primary to-primary/30 hover:from-primary/20 hover:to-primary/40 text-gray-200 font-medium">
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