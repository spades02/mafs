"use client"

import { useEffect, useState } from "react"

export function useCountUp(end: number, duration = 1000, decimals = 0) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        let startTime: number | null = null
        let animationFrame: number

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime
            const progress = Math.min((currentTime - startTime) / duration, 1)

            // Ease-out cubic function for premium feel
            const easeOut = 1 - Math.pow(1 - progress, 3)
            setCount(Number((end * easeOut).toFixed(decimals)))

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate)
            } else {
                setCount(end) // Ensure final value is exact
            }
        }

        animationFrame = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(animationFrame)
    }, [end, duration, decimals])

    return count
}
