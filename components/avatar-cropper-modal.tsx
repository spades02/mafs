"use client"

import { useState, useRef, useCallback } from "react"
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "./ui/dialog"
import { Button } from "./ui/button"
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react"

interface AvatarCropperModalProps {
    isOpen: boolean
    onClose: () => void
    imageSrc: string
    onCropComplete: (croppedBlob: Blob) => void
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: "%",
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight
        ),
        mediaWidth,
        mediaHeight
    )
}

export function AvatarCropperModal({
    isOpen,
    onClose,
    imageSrc,
    onCropComplete,
}: AvatarCropperModalProps) {
    const [crop, setCrop] = useState<Crop>()
    const [completedCrop, setCompletedCrop] = useState<Crop>()
    const [scale, setScale] = useState(1)
    const [rotate, setRotate] = useState(0)
    const [isProcessing, setIsProcessing] = useState(false)
    const imgRef = useRef<HTMLImageElement>(null)

    const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget
        setCrop(centerAspectCrop(width, height, 1))
    }, [])

    const handleZoomIn = () => {
        setScale((prev) => Math.min(prev + 0.1, 3))
    }

    const handleZoomOut = () => {
        setScale((prev) => Math.max(prev - 0.1, 0.5))
    }

    const handleRotate = () => {
        setRotate((prev) => prev + 90)
    }

    const getCroppedImg = async (): Promise<Blob | null> => {
        if (!imgRef.current || !completedCrop) return null

        const image = imgRef.current
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) return null

        const scaleX = image.naturalWidth / image.width
        const scaleY = image.naturalHeight / image.height

        const outputSize = 256
        canvas.width = outputSize
        canvas.height = outputSize

        const toRads = (deg: number) => (deg * Math.PI) / 180
        const rotateRads = toRads(rotate)

        const centerX = image.naturalWidth / 2
        const centerY = image.naturalHeight / 2

        ctx.save()

        // 1. Move to center of canvas
        ctx.translate(outputSize / 2, outputSize / 2)

        // 2. Rotate
        ctx.rotate(rotateRads)

        // 3. Scale? 
        // We need to scale the image so the cropped area fills the outputSize.
        // crop.width in Natural Pixels:
        const naturalCropWidth = completedCrop.width * scaleX
        // Scale Factor = Output / Input
        // Note: 'scale' state is already applied visually, which affects completedCrop size?
        // If we want exact visual match:
        const zoom = outputSize / naturalCropWidth

        ctx.scale(zoom, zoom)

        // 4. Translate center of crop to origin
        // We need crop center in Natural Coordinates relative to Image Center
        const cropNaturalX = completedCrop.x * scaleX
        const cropNaturalY = completedCrop.y * scaleY
        const cropNaturalWidth = completedCrop.width * scaleX
        const cropNaturalHeight = completedCrop.height * scaleY

        const cropCenterX = cropNaturalX + cropNaturalWidth / 2
        const cropCenterY = cropNaturalY + cropNaturalHeight / 2

        ctx.translate(-cropCenterX, -cropCenterY)

        // 5. Draw Image
        ctx.drawImage(
            image,
            0,
            0,
            image.naturalWidth,
            image.naturalHeight,
            0,
            0,
            image.naturalWidth,
            image.naturalHeight,
        )

        ctx.restore()

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    resolve(blob)
                },
                "image/jpeg",
                0.9
            )
        })
    }

    const handleSave = async () => {
        setIsProcessing(true)
        try {
            const croppedBlob = await getCroppedImg()
            if (croppedBlob) {
                onCropComplete(croppedBlob)
                onClose()
            }
        } catch (error) {
            console.error("Error cropping image:", error)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Adjust Profile Picture</DialogTitle>
                    <DialogDescription>
                        Drag to reposition and resize the crop area
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center gap-4">
                    {/* Crop Area */}
                    <div className="relative w-full max-h-[300px] overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={1}
                            circularCrop
                            className="max-h-[300px]"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                ref={imgRef}
                                src={imageSrc}
                                alt="Crop preview"
                                onLoad={onImageLoad}
                                style={{
                                    transform: `scale(${scale}) rotate(${rotate}deg)`,
                                    maxHeight: "300px",
                                    width: "auto",
                                }}
                                className="object-contain"
                            />
                        </ReactCrop>
                    </div>

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleZoomOut}
                            disabled={scale <= 0.5}
                        >
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground w-16 text-center">
                            {Math.round(scale * 100)}%
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleZoomIn}
                            disabled={scale >= 3}
                        >
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleRotate}
                            className="ml-2"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={isProcessing || !completedCrop}
                    >
                        {isProcessing ? "Processing..." : "Apply"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
