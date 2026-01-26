"use client"

import { useRef, useState, useEffect } from "react"
import { Camera } from "lucide-react"
import { ProfileAvatar } from "./profile-avatar"
import { AvatarCropperModal } from "./avatar-cropper-modal"
import { cn } from "@/lib/utils"

type Props = {
  currentAvatarUrl?: string | null
  name?: string | null
  email?: string | null
  disabled?: boolean
  onAvatarChange?: (blob: Blob) => void
  onRemove?: () => void
}

export function AvatarUpload({
  currentAvatarUrl,
  name,
  email,
  disabled = false,
  onAvatarChange,
  onRemove,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [cropperOpen, setCropperOpen] = useState(false)
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null)
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null)

  function openFilePicker() {
    if (disabled) return
    inputRef.current?.click()
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Create object URL for the cropper
    const objectUrl = URL.createObjectURL(file)
    setRawImageSrc(objectUrl)
    setCropperOpen(true)

    // Reset the input so the same file can be selected again
    e.target.value = ""
  }

  function handleCropComplete(blob: Blob) {
    // Create a preview URL from the cropped blob
    const previewUrl = URL.createObjectURL(blob)
    setPreview(previewUrl)
    setCroppedBlob(blob)

    // Notify parent component
    if (onAvatarChange) {
      onAvatarChange(blob)
    }

    // Clean up raw image URL
    if (rawImageSrc) {
      URL.revokeObjectURL(rawImageSrc)
      setRawImageSrc(null)
    }
  }

  function handleCropperClose() {
    setCropperOpen(false)
    // Clean up raw image URL if cropper is closed without saving
    if (rawImageSrc) {
      URL.revokeObjectURL(rawImageSrc)
      setRawImageSrc(null)
    }
  }

  // Expose the cropped blob via a hidden input for form submission
  // This is a workaround since we can't directly set file input values
  useEffect(() => {
    if (croppedBlob && inputRef.current) {
      // Create a new File from the blob
      const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" })

      // Create a DataTransfer to set the file
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      inputRef.current.files = dataTransfer.files
    }
  }, [croppedBlob])

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
      if (rawImageSrc) URL.revokeObjectURL(rawImageSrc)
    }
  }, [preview, rawImageSrc])

  return (
    <>
      <div className="flex flex-col items-center gap-3">
        {/* Clickable Avatar */}
        <button
          type="button"
          onClick={openFilePicker}
          disabled={disabled}
          className={cn(
            "relative group rounded-full focus:outline-none",
            disabled && "opacity-80 cursor-not-allowed"
          )}
        >
          <ProfileAvatar
            avatarUrl={preview ?? currentAvatarUrl}
            name={name}
            email={email}
            size={96}
          />

          {/* Hover Overlay */}
          {!disabled && (
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <Camera className="h-6 w-6 text-white" />
            </div>
          )}
        </button>

        {/* Hidden Input */}
        <input
          ref={inputRef}
          type="file"
          name="avatar"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
          disabled={disabled}
        />

        <div className="flex flex-col items-center gap-1">
          <span className="text-sm text-muted-foreground">
            {preview ? "Click to change photo" : "Click to upload photo"}
          </span>
          {/* Show remove if:
              1. We have a new preview (preview is string and not empty)
              2. OR we have an existing avatar AND preview is null (meaning no changes yet)
              If preview === "" it means we explicitly removed it, so don't show remove button.
              AND NOT disabled
          */}
          {((preview && preview !== "") || (currentAvatarUrl && preview === null)) && onRemove && !disabled && (
            <button
              type="button"
              onClick={() => {
                setPreview("")
                setCroppedBlob(null)
                if (inputRef.current) inputRef.current.value = ""
                onRemove()
              }}
              className="text-xs text-red-500 hover:text-red-400 transition-colors hover:underline"
            >
              Remove photo
            </button>
          )}
        </div>
      </div>

      {/* Cropper Modal */}
      {rawImageSrc && (
        <AvatarCropperModal
          isOpen={cropperOpen}
          onClose={handleCropperClose}
          imageSrc={rawImageSrc}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  )
}
