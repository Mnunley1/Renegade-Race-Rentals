"use client"

import { cn } from "@workspace/ui/lib/utils"
import { useEffect, useMemo, useRef } from "react"

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
  disabled?: boolean
  autoFocus?: boolean
  hasError?: boolean
}

/**
 * Segmented one-time-code input — auto-advances, supports backspace,
 * arrow keys, and pasting a full code. No external dependency.
 */
export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  autoFocus = false,
  hasError = false,
}: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const digits = value.split("")
  const cellIds = useMemo(() => Array.from({ length }, (_, i) => `otp-cell-${i}`), [length])

  useEffect(() => {
    if (autoFocus) {
      refs.current[0]?.focus()
    }
  }, [autoFocus])

  const focusAt = (i: number) => {
    const idx = Math.max(0, Math.min(i, length - 1))
    refs.current[idx]?.focus()
    refs.current[idx]?.select()
  }

  const handleChange = (index: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, "")
    if (!cleaned) {
      const arr = value.split("")
      arr[index] = ""
      onChange(arr.join(""))
      return
    }
    const arr = value.padEnd(length, " ").split("")
    let cursor = index
    for (const char of cleaned.split("")) {
      if (cursor >= length) break
      arr[cursor] = char
      cursor++
    }
    onChange(arr.join("").replace(/\s/g, "").slice(0, length))
    focusAt(cursor)
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault()
      const arr = value.split("")
      if (arr[index]) {
        arr[index] = ""
        onChange(arr.join(""))
      } else if (index > 0) {
        arr[index - 1] = ""
        onChange(arr.join(""))
        focusAt(index - 1)
      }
    } else if (e.key === "ArrowLeft") {
      focusAt(index - 1)
    } else if (e.key === "ArrowRight") {
      focusAt(index + 1)
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
    if (text) {
      onChange(text)
      focusAt(text.length)
    }
  }

  return (
    <div className="flex justify-between gap-2 sm:gap-3">
      {cellIds.map((id, i) => (
        <input
          aria-label={`Digit ${i + 1}`}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          className={cn(
            "h-12 w-full rounded-lg border bg-background text-center font-semibold text-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 sm:h-14 sm:text-xl",
            hasError
              ? "border-destructive focus:border-destructive"
              : "border-input focus:border-primary",
            disabled && "cursor-not-allowed opacity-50"
          )}
          disabled={disabled}
          inputMode="numeric"
          key={id}
          maxLength={1}
          onChange={(e) => handleChange(i, e.target.value)}
          onFocus={(e) => e.target.select()}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          ref={(el) => {
            refs.current[i] = el
          }}
          value={digits[i] ?? ""}
        />
      ))}
    </div>
  )
}
