"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Target, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  return (
    <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center px-4 bg-digital-noise">
      <div className="w-full max-w-md text-primary">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center shadow-lg shadow-primary/30">
            <Target className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">MAFS</h1>
            <p className="text-xs">Multi-Agent Fight Simulator</p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-primary/10 rounded-2xl p-8 shadow-2xl">
          {!sent ? (
            <>
              <h2 className="text-2xl font-bold mb-2">Forgot your password?</h2>
              <p className="text-sm mb-6">Enter your email and we'll send you a reset link.</p>

              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  setSent(true)
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="bg-foreground/5 border-foreground/10 text-foreground placeholder:text-gray-500"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-linear-to-r from-primary/20 to-primary/40 hover:from-primary/40 hover:to-primary/60 text-gray-200 font-medium"
                >
                  Send Reset Link
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Check your email</h3>
              <p className="text-sm text-primary mb-6">We've sent a password reset link to your email address.</p>
            </div>
          )}

          <div className="mt-6">
            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 text-sm text-blue-400 hover:text-blue-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
