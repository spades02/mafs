"use client"

import { useRef, useState, useEffect } from "react"
import { Camera } from "lucide-react"
import { ProfileAvatar } from "./profile-avatar"

type Props = {
  currentAvatarUrl?: string | null
  name?: string | null
  email?: string | null
}

export function AvatarUpload({
  currentAvatarUrl,
  name,
  email,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  function openFilePicker() {
    inputRef.current?.click()
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
  }

  // cleanup
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Clickable Avatar */}
      <button
        type="button"
        onClick={openFilePicker}
        className="relative group rounded-full focus:outline-none"
      >
        <ProfileAvatar
          avatarUrl={preview ?? currentAvatarUrl}
          name={name}
          email={email}
          size={96}
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <Camera className="h-6 w-6 text-white" />
        </div>
      </button>
    {/* Hidden Input */}
      <input
        ref={inputRef}
        type="file"
        name="avatar"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
      <span className="text-sm text-muted-foreground">
        Click to change photo
      </span>
    </div>
  )
}
