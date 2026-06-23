"use client"

import { cn } from "@workspace/ui/lib/utils"
import type { ComponentProps } from "react"
import { useEffect, useRef, useState } from "react"

interface RevealProps extends ComponentProps<"div"> {
  /** Delay before the reveal transition starts, in ms */
  delay?: number
  /** Direction the element animates in from */
  from?: "up" | "left" | "right"
}

/**
 * Reveals its children with a subtle fade + slide once scrolled into view.
 * Uses IntersectionObserver so there is no animation-library dependency.
 * Falls back to visible immediately when reduced motion is preferred.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  from = "up",
  style,
  ...props
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const hiddenTransformMap = {
    up: "translate-y-10",
    left: "-translate-x-8",
    right: "translate-x-8",
  } as const
  const hiddenTransform = hiddenTransformMap[from]

  return (
    <div
      className={cn(
        "transition-all duration-700 ease-out will-change-transform motion-reduce:transition-none",
        visible ? "translate-x-0 translate-y-0 opacity-100" : cn("opacity-0", hiddenTransform),
        className
      )}
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms", ...style }}
      {...props}
    >
      {children}
    </div>
  )
}
