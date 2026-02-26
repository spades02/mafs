"use client"

import { useEffect, useState, Suspense } from "react"
import { authClient, useSession } from "@/lib/auth/auth-client"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, Mail, Send } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

function VerifyEmailContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get("token")
    const { data: session } = useSession()

    // Status can be: 'verifying' (if token present), 'success', 'error', or 'pending' (waiting for user action)
    const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'pending'>('pending')
    const [message, setMessage] = useState("")
    const [isResending, setIsResending] = useState(false)

    useEffect(() => {
        if (!token) {
            // If no token, we are waiting for user to check email
            setStatus('pending')
            return
        }

        setStatus('verifying')
        const verify = async () => {
            const { error } = await authClient.verifyEmail({
                query: {
                    token
                }
            })

            if (error) {
                setStatus('error')
                setMessage(error.message || "Failed to verify email")
            } else {
                setStatus('success')
            }
        }

        verify()
    }, [token])

    const handleResendEmail = async () => {
        if (!session?.user?.email) return

        setIsResending(true)
        try {
            await authClient.sendVerificationEmail({
                email: session.user.email,
                callbackURL: "/verify-email" // Redirect back here after clicking link
            })
            toast.success("Verification email sent!")
        } catch {
            toast.error("Failed to send email")
        } finally {
            setIsResending(false)
        }
    }

    // Pending State (No token - User redirected here after signup/login)
    if (status === 'pending') {
        return (
            <div className="bg-background h-fit border border-primary/10 rounded-2xl p-8 shadow-2xl w-full max-w-md text-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Verify your email</h2>
                    <p className="text-gray-400">
                        We've sent a verification link to <br />
                        <span className="text-white font-medium">{session?.user?.email || "your email address"}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                        Please check your inbox and click the link to verify your account.
                    </p>

                    <div className="flex flex-col gap-3 w-full mt-4">
                        <Button
                            onClick={handleResendEmail}
                            disabled={isResending || !session?.user?.email}
                            variant="outline"
                            className="w-full border-primary/20 hover:bg-primary/10 hover:text-primary"
                        >
                            {isResending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" /> Resend Verification Email
                                </>
                            )}
                        </Button>

                        <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={async () => { await authClient.signOut() }}>
                            Back to Login
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-primary/10 rounded-2xl p-8 shadow-2xl w-full max-w-md text-center">
            {status === 'verifying' && (
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <h2 className="text-2xl font-bold">Verifying Email...</h2>
                    <p className="text-gray-400">Please wait while we verify your email address.</p>
                </div>
            )}

            {status === 'success' && (
                <div className="flex flex-col items-center gap-4">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                    <h2 className="text-2xl font-bold text-white">Email Verified!</h2>
                    <p className="text-gray-400">Your email has been successfully verified.</p>
                    <Button asChild className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                        <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                </div>
            )}

            {status === 'error' && (
                <div className="flex flex-col items-center gap-4">
                    <XCircle className="w-12 h-12 text-red-500" />
                    <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
                    <p className="text-red-400">{message}</p>
                    <Button variant="outline" className="w-full mt-4" onClick={async () => { await authClient.signOut() }}>
                        Back to Login
                    </Button>
                </div>
            )}
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center px-4 bg-digital-noise">
            <Suspense fallback={<div className="text-white">Loading...</div>}>
                <VerifyEmailContent />
            </Suspense>
        </div>
    )
}
