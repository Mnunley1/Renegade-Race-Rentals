"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { useMutation } from "convex/react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import type { Id } from "@/lib/convex"
import { api } from "@/lib/convex"
import { handleErrorWithContext } from "@/lib/error-handler"

type Props = {
  coachProfileId: Id<"coachProfiles">
  coachName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CoachContactDialog({ coachProfileId, coachName, open, onOpenChange }: Props) {
  const router = useRouter()
  const createConversation = useMutation(api.conversations.createCoachingConversation)

  const [message, setMessage] = useState("")
  const [eventName, setEventName] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Add a message so the coach knows what you're looking for")
      return
    }
    setSubmitting(true)
    try {
      const conversationId = await createConversation({
        coachProfileId,
        message: message.trim(),
        eventName: eventName.trim() || undefined,
      })
      toast.success(`Message sent to ${coachName}`)
      onOpenChange(false)
      setMessage("")
      setEventName("")
      router.push(`/messages?conversationId=${conversationId}`)
    } catch (err) {
      handleErrorWithContext(err, { action: "contact coach", entity: "conversation" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Contact {coachName}</DialogTitle>
          <DialogDescription>
            Send a message to start the conversation. You'll plan dates, rates, and details together
            from there.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="event">Event you're prepping for (optional)</Label>
            <Input
              id="event"
              maxLength={200}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. SCCA weekend at COTA, March 14"
              value={eventName}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              maxLength={2000}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What car you're driving, your experience level, what dates you're considering, what you want to work on…"
              rows={6}
              value={message}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={submitting} onClick={handleSubmit} type="button">
            {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Send message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
