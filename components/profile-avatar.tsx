import Image from "next/image"
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
  const initials = getInitials(name, email)

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full bg-muted text-lg font-medium text-muted-foreground"
      )}
      style={{ width: size, height: size }}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt="Profile picture"
          fill
          className="rounded-full object-cover"
        />
      ) : (
        <span className="select-none text-white font-semibold">
          {initials}
        </span>
      )}
    </div>
  )
}

function getInitials(name?: string | null, email?: string | null) {
  const safeName = name?.trim()
  console.log("ame", name)
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
