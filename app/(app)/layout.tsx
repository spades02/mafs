// app/(app)/layout.tsx
import { auth } from "@/app/lib/auth/auth"
import { headers } from "next/headers"

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Session check is good to keep for server-side protection/redirects if needed,
    // though middleware handles most protection.
    const session = await auth.api.getSession({
        headers: await headers()
    })

    return (
        <div className="flex min-h-[calc(100vh-65px)] w-full">
            <div className="flex-1 w-full relative">
                {children}
            </div>
        </div>
    )
}
