"use client"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { useMutation, useQuery } from "convex/react"
import { Loader2, Paperclip, Send, X } from "lucide-react"
import Image from "next/image"
import { type RefObject, useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { MAX_FILE_SIZE_BYTES } from "@/lib/constants"
import { api } from "@/lib/convex"
import { handleErrorWithContext } from "@/lib/error-handler"
import { ALLOWED_IMAGE_FORMATS_LABEL, isAllowedImageFile } from "@/lib/image-validation"
import { r2Url } from "@/lib/r2-url"
import type { MessageAttachment } from "./message-bubble"

interface ReplyingToData {
  content: string
}

interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  onSend: (attachments: MessageAttachment[]) => void
  replyingTo: ReplyingToData | null | undefined
  onCancelReply: () => void
  inputRef?: RefObject<HTMLTextAreaElement | null>
  maxLength?: number
  warnThreshold?: number
  userId: string
}

const MAX_ATTACHMENTS = 5

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [attachments, setAttachments] = useState<MessageAttachment[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const generateUploadUrl = useMutation(api.r2.generateUploadUrlWithKey)
  const templatesResult = useQuery(api.messageTemplates.list, userId ? { userId } : "skip")

  const templates = [
    ...(templatesResult?.customTemplates ?? []),
    ...(templatesResult?.platformTemplates ?? []),
  ]

  const canSend =
    (value.trim().length > 0 || attachments.length > 0) && value.length <= maxLength && !isUploading

  // Auto-grow the textarea to fit its content (capped via max-height in CSS)
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [textareaRef, value])

  const handleSend = useCallback(() => {
    if (!canSend) return
    onSend(attachments)
    setAttachments([])
  }, [canSend, onSend, attachments])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const handleSelectTemplate = useCallback(
    (content: string) => {
      onChange(content)
      textareaRef.current?.focus()
    },
    [onChange, textareaRef]
  )

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files || files.length === 0) return

      const fileArray = Array.from(files)
      if (attachments.length + fileArray.length > MAX_ATTACHMENTS) {
        toast.error(`You can attach up to ${MAX_ATTACHMENTS} images.`)
        e.target.value = ""
        return
      }

      setIsUploading(true)
      try {
        for (const file of fileArray) {
          if (!isAllowedImageFile(file)) {
            toast.error(`${file.name} must be ${ALLOWED_IMAGE_FORMATS_LABEL}`)
            continue
          }
          if (file.size > MAX_FILE_SIZE_BYTES) {
            toast.error(
              `${file.name} is too large. Maximum size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.`
            )
            continue
          }

          const { url, key } = await generateUploadUrl({})
          const res = await fetch(url, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type },
          })
          if (!res.ok) {
            throw new Error(`Upload failed: ${res.status} ${res.statusText}`)
          }

          setAttachments((prev) => [
            ...prev,
            { type: "image", url: key, fileName: file.name, fileSize: file.size },
          ])
        }
      } catch (error) {
        handleErrorWithContext(error, {
          action: "upload attachment",
          customMessages: { generic: "Failed to upload image. Please try again." },
        })
      } finally {
        setIsUploading(false)
        e.target.value = ""
      }
    },
    [attachments.length, generateUploadUrl]
  )

  const removeAttachment = useCallback((key: string) => {
    setAttachments((prev) => prev.filter((a) => a.url !== key))
  }, [])

  const showTemplates =
    templates.length > 0 && value.trim().length === 0 && attachments.length === 0

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

      {/* Pending attachment previews */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <div className="relative h-16 w-16" key={attachment.url}>
              <Image
                alt={attachment.fileName}
                className="h-16 w-16 rounded-md object-cover"
                height={64}
                src={r2Url(attachment.url)}
                width={64}
              />
              <button
                aria-label={`Remove ${attachment.fileName}`}
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background shadow"
                onClick={() => removeAttachment(attachment.url)}
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {isUploading && (
            <div className="flex h-16 w-16 items-center justify-center rounded-md border border-border border-dashed">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Attach button */}
        <input
          accept="image/*"
          className="hidden"
          multiple
          onChange={handleFileChange}
          ref={fileInputRef}
          type="file"
        />
        <Button
          aria-label="Attach image"
          className="min-h-[44px] min-w-[44px] flex-shrink-0"
          disabled={isUploading || attachments.length >= MAX_ATTACHMENTS}
          onClick={() => fileInputRef.current?.click()}
          size="sm"
          variant="outline"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Paperclip className="h-4 w-4" />
          )}
        </Button>

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
          onClick={handleSend}
          size="sm"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
