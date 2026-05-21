'use client'

import { Button } from './ui/button'
import { authClient } from '@/lib/auth/auth-client'
import { Capacitor } from '@capacitor/core'
import { toast } from 'sonner'

type AppleLoginButtonProps = {
    disabled: boolean
    onClick: () => void
}

/**
 * Sign in with Apple — required by App Store Guideline 4.8.
 *
 * - On native iOS: uses the NATIVE Apple sign-in sheet (@capacitor-community/apple-sign-in),
 *   then exchanges the returned identityToken with Better Auth (`idToken` flow). This keeps
 *   the entire flow in-app — no external browser (satisfies Guideline 4 as well).
 * - On web/Android: falls back to Better Auth's standard Apple OAuth redirect.
 */
function AppleLoginButton({ disabled = false, onClick }: AppleLoginButtonProps) {
    const handleAppleAuth = async () => {
        onClick()
        try {
            const isNativeiOS =
                Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios'

            if (isNativeiOS) {
                // Native Apple sign-in sheet (in-app). Loaded lazily so it never
                // ships in the web bundle / runs during SSR.
                const { SignInWithApple } = await import('@capacitor-community/apple-sign-in')
                const result = await SignInWithApple.authorize({
                    clientId: process.env.NEXT_PUBLIC_APPLE_APP_BUNDLE_IDENTIFIER || 'ai.mafs.app',
                    redirectURI: 'https://mafs.ai/api/auth/callback/apple',
                    scopes: 'email name',
                })

                const idToken = result.response?.identityToken
                if (!idToken) {
                    toast.error('Apple sign-in was cancelled or returned no token.')
                    return
                }

                await authClient.signIn.social(
                    {
                        provider: 'apple',
                        idToken: { token: idToken },
                    },
                    {
                        onSuccess: () => {
                            window.location.href = '/dashboard'
                        },
                        onError: (ctx) => {
                            toast.error(ctx.error.message || 'Apple sign-in failed.')
                        },
                    },
                )
                return
            }

            // Web / Android: standard redirect-based Apple OAuth.
            await authClient.signIn.social({
                provider: 'apple',
                callbackURL: '/',
                errorCallbackURL: '/auth/login',
            })
        } catch (err) {
            // The native plugin throws on user cancellation — treat as a no-op.
            const message = err instanceof Error ? err.message : ''
            if (/cancel/i.test(message)) return
            console.error('[apple-login]', err)
            toast.error('Apple sign-in failed. Please try again.')
        }
    }

    return (
        <Button
            disabled={disabled}
            onClick={handleAppleAuth}
            variant="outline"
            className="w-full text-primary hover:text-primary/60 border-foreground/10 hover:bg-transparent/5 bg-transparent mt-4"
        >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16.365 1.43c0 1.14-.467 2.231-1.225 3.026-.819.862-2.16 1.527-3.281 1.438-.13-1.106.444-2.29 1.157-3.034C13.788 1.997 15.262 1.31 16.365 1.43zM20.99 17.02c-.57 1.32-.844 1.91-1.577 3.08-1.024 1.63-2.467 3.66-4.256 3.676-1.589.015-1.997-1.034-4.153-1.022-2.155.012-2.605 1.04-4.194 1.025-1.789-.016-3.156-1.85-4.18-3.48C-.13 16.94-.39 11.99 1.74 9.36c.95-1.18 2.45-1.93 3.86-1.93 1.44 0 2.34.79 3.53.79 1.15 0 1.85-.79 3.52-.79 1.26 0 2.6.69 3.55 1.88-3.12 1.71-2.61 6.17.79 7.71z" />
            </svg>
            Continue with Apple
        </Button>
    )
}

export default AppleLoginButton
