"use client"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { useQuery } from "convex/react"
import { Send, X } from "lucide-react"
import { type RefObject, useCallback, useEffect, useRef } from "react"
import { api } from "@/lib/convex"

interface ReplyingToData {
  content: string
}

interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  replyingTo: ReplyingToData | null | undefined
  onCancelReply: () => void
  inputRef?: RefObject<HTMLTextAreaElement | null>
  maxLength?: number
  warnThreshold?: number
  userId: string
}

export function MessageInput({
  value,
  onChange,
  onSend,
  replyingTo,
  onCancelReply,
  inputRef,
  maxLength = 2000,
  warnThreshold = 1800,
  userId,
}: MessageInputProps) {
  const localRef = useRef<HTMLTextAreaElement>(null)
  const textareaRef = inputRef ?? localRef

  const templatesResult = useQuery(api.messageTemplates.list, userId ? { userId } : "skip")

  const templates = [
    ...(templatesResult?.customTemplates ?? []),
    ...(templatesResult?.platformTemplates ?? []),
  ]

  const canSend = value.trim().length > 0 && value.length <= maxLength

  // Auto-grow the textarea to fit its content (capped via max-height in CSS)
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [textareaRef, value])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && canSend) {
        e.preventDefault()
        onSend()
      }
    },
    [onSend, canSend]
  )

  const handleSelectTemplate = useCallback(
    (content: string) => {
      onChange(content)
      textareaRef.current?.focus()
    },
    [onChange, textareaRef]
  )

  const showTemplates = templates.length > 0 && value.trim().length === 0

  return (
    <div className="border-t p-4">
      {/* Reply indicator */}
      {replyingTo && (
        <div className="mb-3 rounded-lg border-[#EF1C25] border-l-4 bg-muted p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="mb-1 text-muted-foreground text-xs">Replying to:</p>
              <p className="truncate text-foreground text-sm">{replyingTo.content}</p>
            </div>
            <Button
              aria-label="Cancel reply"
              className="ml-2 h-6 min-h-[44px] w-6 min-w-[44px] p-0"
              onClick={onCancelReply}
              size="sm"
              variant="ghost"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Quick-reply chips */}
      {showTemplates && (
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {templates.map((template) => (
            <button
              className="flex-shrink-0 rounded-full border border-border bg-background px-3 py-1.5 text-foreground text-xs transition-colors hover:border-[#EF1C25] hover:bg-[#EF1C25]/5"
              key={`${template.label}-${template.content}`}
              onClick={() => handleSelectTemplate(template.content)}
              type="button"
            >
              {template.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <textarea
            className="flex max-h-40 min-h-[44px] w-full resize-none rounded-md border border-input bg-background px-3 py-2.5 pr-16 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            maxLength={maxLength + 100}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={replyingTo ? "Type your reply..." : "Type a message..."}
            ref={textareaRef}
            rows={1}
            value={value}
          />
          {value.length > warnThreshold && (
            <span
              aria-live="polite"
              className={cn(
                "absolute right-2 bottom-2 text-xs tabular-nums",
                value.length > maxLength ? "font-medium text-destructive" : "text-muted-foreground"
              )}
            >
              {value.length}/{maxLength}
            </span>
          )}
        </div>
        <Button
          aria-label="Send message"
          className="min-h-[44px] min-w-[44px] flex-shrink-0"
          disabled={!canSend}
          onClick={onSend}
          size="sm"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
