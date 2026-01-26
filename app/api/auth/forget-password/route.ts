
import { auth } from "@/app/lib/auth/auth"
import { NextResponse, NextRequest } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { email, redirectTo } = body

        // Call requestPasswordReset (was forgetPassword)
        const response = await auth.api.requestPasswordReset({
            body: {
                email,
                redirectTo
            },
            headers: req.headers
        })

        return NextResponse.json(response)
    } catch (error: any) {
        console.error("Forgot Password Error:", error)
        return NextResponse.json(
            { message: error?.message || "Internal Server Error" },
            { status: 500 }
        )
    }
}
