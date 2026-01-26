"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

type Props = {
  avatarUrl?: string | null
  name?: string | null
  email?: string | null
  size?: number
}

export function ProfileAvatar({
  avatarUrl,
  name,
  email,
  size = 96,
}: Props) {
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    setImageError(false)
  }, [avatarUrl])

  const initials = getInitials(name, email)
  const showInitials = !avatarUrl || imageError

  // Generate a consistent color based on the name/email
  const backgroundColor = getColorFromString(name || email || "User")

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full overflow-hidden",
        showInitials && "bg-linear-to-br from-primary to-primary/60"
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: showInitials ? backgroundColor : undefined
      }}
    >
      {showInitials ? (
        <span
          className="select-none text-white font-semibold"
          style={{ fontSize: size * 0.4 }}
        >
          {initials}
        </span>
      ) : (
        <Image
          src={avatarUrl}
          alt="Profile picture"
          fill
          className="rounded-full object-cover"
          onError={() => setImageError(true)}
          unoptimized={avatarUrl?.startsWith('blob:')}
        />
      )}
    </div>
  )
}

function getInitials(name?: string | null, email?: string | null) {
  const safeName = name?.trim()
  const safeEmail = email?.trim()

  if (safeName) {
    return safeName
      .split(/\s+/)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join("")
  }

  if (safeEmail) {
    return safeEmail[0].toUpperCase()
  }

  return "U"
}

// Generate a consistent color based on string
function getColorFromString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = hash % 360
  return `hsl(${hue}, 65%, 50%)`
}