"use server"

import { auth } from "@/app/lib/auth/auth"
import { headers } from "next/headers"

export async function setPassword(password: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        // Try updateUser first, as it's the standard way to update profile fields including password
        // Normally this requires current password, but for users without one (OAuth), it depends on configuration.
        // If this fails, we might need a more direct approach or check if 'setPassword' exists on the API.

        await auth.api.setPassword({
            headers: await headers(),
            body: {
                newPassword: password
            }
        })

        return { success: true }
    } catch (e: any) {
        // If updateUser fails due to missing current password, we might need to use a different method.
        // However, standard better-auth flows for setting a password on an OAuth account often involve 'forget password' flow or specific linking.
        // But let's assume updateUser helps if configured correctly.
        console.error("Set password error:", e)
        return { success: false, error: e.message || "Failed to set password" }
    }
}
