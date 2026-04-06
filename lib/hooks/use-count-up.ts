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

// Scroll-triggered variant — animation starts only when the passed-in ref scrolls into view.
// Caller owns the ref and attaches it to the element, then reads the returned value string.
import type { RefObject } from "react"
export function useCountUpOnView(
    targetRef: RefObject<HTMLElement | null>,
    target: number,
    duration = 2000,
    opts: { suffix?: string; prefix?: string } = {}
): string {
    const { suffix = "", prefix = "" } = opts
    const [count, setCount] = useState(0)
    const [hasStarted, setHasStarted] = useState(false)

    useEffect(() => {
        const el = targetRef.current
        if (!el) return
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasStarted) setHasStarted(true)
            },
            { threshold: 0.1 }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [hasStarted, targetRef])

    useEffect(() => {
        if (!hasStarted) return
        const start = Date.now()
        const frame = () => {
            const elapsed = Date.now() - start
            if (elapsed >= duration) {
                setCount(target)
                return
            }
            const progress = elapsed / duration
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(target * eased))
            requestAnimationFrame(frame)
        }
        requestAnimationFrame(frame)
    }, [target, duration, hasStarted])

    return prefix + count.toLocaleString() + suffix
}
