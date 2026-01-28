'use server'

import { auth } from "@/app/lib/auth/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { uploadAvatar, type UploadAvatarResult } from "./upload-avatar"
import { db } from "@/db"
import { user } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function updateProfile(formData: FormData) {
  try {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' }
    }

    const userId = session.user.id
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const avatarFile = formData.get('avatar') as File | null

    // Validate inputs
    if (!name || name.trim() === '') {
      return { success: false, error: 'Name is required' }
    }

    if (!email || email.trim() === '') {
      return { success: false, error: 'Email is required' }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Invalid email format' }
    }

    let newAvatarPath = session.user.image
    const removeAvatar = formData.get('removeAvatar') === 'true'

    if (removeAvatar) {
      newAvatarPath = null
    }

    // Handle avatar upload if there's a new file
    if (avatarFile && avatarFile.size > 0) {
      const avatarFormData = new FormData()
      avatarFormData.append('avatar', avatarFile)

      const uploadResult = await uploadAvatar(avatarFormData)

      if (uploadResult.success && uploadResult.avatarPath) {
        newAvatarPath = uploadResult.avatarPath
      } else {
        return { success: false, error: uploadResult.error || 'Failed to upload avatar' }
      }
    }

    const timeZone = formData.get('timeZone') as string
    const oddsFormat = formData.get('oddsFormat') as string
    const emailAlerts = formData.get('emailAlerts') === 'true'
    const riskWarnings = formData.get('riskWarnings') === 'true'

    // Update user in database using Drizzle ORM
    await db
      .update(user)
      .set({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        image: newAvatarPath,
        timeZone: timeZone || undefined,
        oddsFormat: oddsFormat || undefined,
        emailAlerts: formData.has('emailAlerts') ? emailAlerts : undefined,
        riskWarnings: formData.has('riskWarnings') ? riskWarnings : undefined,
      })
      .where(eq(user.id, userId))

    // Revalidate the profile page and any other pages that show user info
    revalidatePath('/profile')
    revalidatePath('/settings')
    revalidatePath('/') // If user info is shown on home page

    return {
      success: true,
      message: 'Profile updated successfully',
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        image: newAvatarPath
      }
    }

  } catch (error) {
    console.error('Profile update error:', error)

    // Handle specific database errors
    if (error instanceof Error) {
      // Check for duplicate email error (common in databases)
      if (error.message.includes('unique') || error.message.includes('duplicate')) {
        return { success: false, error: 'Email already in use' }
      }

      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to update profile' }
  }
}