"use server"

import { auth } from "@/app/lib/auth/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
    const nextHeaders = await headers();
    const authHeaders = new Headers(nextHeaders);
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  try {
    const result = await auth.api.signInEmail({
      body: { email, password },
      headers: authHeaders, // ❗ NO await
    }
)

    if (!result) {
      return { error: "Invalid email or password" }
    }

  } catch (err: any) {
    return { error: err.message ?? "Login failed" }
  }

  redirect("/dashboard")
}
