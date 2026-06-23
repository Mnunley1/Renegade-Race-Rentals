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
import { Loader2, Star } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import type { Id } from "@/lib/convex"
import { api } from "@/lib/convex"
import { handleErrorWithContext } from "@/lib/error-handler"

type Props = {
  bookingId: Id<"coachingBookings">
  coachName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function StarRating({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: number) => void
  value: number
}) {
  return (
    <div>
      <Label className="mb-2 block">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            className="transition-colors hover:opacity-80 focus:outline-none"
            key={star}
            onClick={() => onChange(star)}
            type="button"
          >
            <Star
              className={`size-6 ${
                star <= value ? "fill-primary text-primary" : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

export function CoachReviewDialog({ bookingId, coachName, open, onOpenChange }: Props) {
  const submitReview = useMutation(api.coachingReviews.submitReview)

  const [rating, setRating] = useState(0)
  const [communication, setCommunication] = useState(0)
  const [knowledge, setKnowledge] = useState(0)
  const [value, setValue] = useState(0)
  const [title, setTitle] = useState("")
  const [review, setReview] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating <= 0) {
      toast.error("Please select an overall rating")
      return
    }
    if (!(title.trim() && review.trim())) {
      toast.error("Please add a title and review")
      return
    }

    setSubmitting(true)
    try {
      await submitReview({
        bookingId,
        rating,
        communication: communication > 0 ? communication : undefined,
        knowledge: knowledge > 0 ? knowledge : undefined,
        value: value > 0 ? value : undefined,
        title: title.trim(),
        review: review.trim(),
      })
      toast.success("Thanks for your review")
      onOpenChange(false)
    } catch (err) {
      handleErrorWithContext(err, { action: "submit review", entity: "review" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Review your coaching session</DialogTitle>
          <DialogDescription>Share your experience with {coachName}.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <StarRating label="Overall rating *" onChange={setRating} value={rating} />

          <div className="grid gap-4 sm:grid-cols-3">
            <StarRating label="Communication" onChange={setCommunication} value={communication} />
            <StarRating label="Knowledge" onChange={setKnowledge} value={knowledge} />
            <StarRating label="Value" onChange={setValue} value={value} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your review a title"
              value={title}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="review">Review *</Label>
            <Textarea
              id="review"
              maxLength={2000}
              onChange={(e) => setReview(e.target.value)}
              placeholder="What went well? What could the coach improve?"
              rows={5}
              value={review}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={submitting} onClick={handleSubmit} type="button">
            {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Submit review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
