"use server"

import { supabaseServer } from "@/lib/supabase/server"
import { db } from "@/db"
import { user } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/app/lib/auth/auth"
import { headers } from "next/headers"

export type UploadAvatarResult = {
  success: boolean
  avatarPath?: string
  error?: string
}

export async function uploadAvatar(formData: FormData): Promise<UploadAvatarResult> {
  try {
    console.log("formdata", formData)
    const h = await headers()

    const session = await auth.api.getSession({
      headers: Object.fromEntries(h.entries()),
    })
    
    if (!session) {
      return { success: false, error: "Unauthorized" }
    }

    const userId = session.user.id
    const file = formData.get("avatar") as File

    if (!file || !file.size) {
      return { success: false, error: "No file provided" }
    }

    const imagePath = `user_${userId}/avatar.webp`

    // Try to remove the old file (ignore errors if it doesn't exist)
    const { error: removeError } = await supabaseServer.storage
      .from("avatars")
      .remove([imagePath])
    
    // Log remove error but don't fail (file might not exist)
    if (removeError) {
      console.log("Remove error (file might not exist):", removeError.message)
    }

    // Upload to Supabase with upsert to handle edge cases
    const { error: uploadError } = await supabaseServer.storage
      .from("avatars")
      .upload(imagePath, file, {
        upsert: true, // This is key - it will overwrite if file still exists
        contentType: "image/webp",
        cacheControl: "3600",
      })
  
    if (uploadError) {
      console.error("Upload error:", uploadError)
      return { success: false, error: uploadError.message }
    }

    // Save path in DB
    await db
      .update(user)
      .set({ image: imagePath })
      .where(eq(user.id, userId))

    return { success: true, avatarPath: imagePath }
    
  } catch (error) {
    console.error("Avatar upload error:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to upload avatar" 
    }
  }
}