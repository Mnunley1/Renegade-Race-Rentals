"use client"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { useMutation, useQuery } from "convex/react"
import { ArrowLeft, Ban, CheckCircle, Loader2, XCircle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { StatusBadge } from "@/components/status-badge"
import type { Id } from "@/lib/convex"
import { api } from "@/lib/convex"
import { handleErrorWithContext } from "@/lib/error-handler"

type ActionType = "verify" | "reject" | "takedown"

const actionConfig: Record<
  ActionType,
  { title: string; description: string; confirmLabel: string; entity: string }
> = {
  verify: {
    title: "Verify Coach",
    description: "Mark this coach as verified. They will be visible and bookable.",
    confirmLabel: "Verify",
    entity: "coach",
  },
  reject: {
    title: "Reject Coach",
    description: "Reject this coach's verification request.",
    confirmLabel: "Reject",
    entity: "coach",
  },
  takedown: {
    title: "Take Down Coach",
    description: "Deactivate this coach profile so it is no longer visible.",
    confirmLabel: "Take Down",
    entity: "coach",
  },
}

function formatRate(cents?: number) {
  if (cents === undefined || cents === null) return null
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
}

export default function CoachDetailPage() {
  const params = useParams()
  const profileId = params.id as Id<"coachProfiles">

  const coach = useQuery(api.coachProfiles.getByIdForAdmin, { profileId })
  const verifyCoach = useMutation(api.coachProfiles.verifyCoach)
  const rejectCoach = useMutation(api.coachProfiles.rejectCoach)
  const takedownCoach = useMutation(api.coachProfiles.takedownCoach)

  const [activeAction, setActiveAction] = useState<ActionType | null>(null)
  const [notes, setNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const openDialog = (action: ActionType) => {
    setActiveAction(action)
    setNotes("")
  }

  const handleConfirm = async () => {
    if (!activeAction) return
    setIsProcessing(true)
    try {
      const args = { profileId, notes: notes.trim() || undefined }
      if (activeAction === "verify") await verifyCoach(args)
      else if (activeAction === "reject") await rejectCoach(args)
      else await takedownCoach(args)
      toast.success(`Coach ${actionConfig[activeAction].confirmLabel.toLowerCase()} successful`)
      setActiveAction(null)
    } catch (error) {
      handleErrorWithContext(error, {
        action: actionConfig[activeAction].confirmLabel.toLowerCase(),
        entity: "coach",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (coach === undefined) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-muted-foreground">Loading coach...</div>
      </div>
    )
  }

  if (coach === null) {
    return (
      <div className="space-y-6">
        <Link href="/coaching/coaches">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 size-4" />
            Back to Coaches
          </Button>
        </Link>
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            Coach not found
          </CardContent>
        </Card>
      </div>
    )
  }

  const rates = [
    { label: "Hourly", value: formatRate(coach.hourlyRate) },
    { label: "Half Day", value: formatRate(coach.halfDayRate) },
    { label: "Full Day", value: formatRate(coach.fullDayRate) },
  ].filter((r) => r.value !== null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/coaching/coaches">
            <Button className="mb-4" variant="ghost">
              <ArrowLeft className="mr-2 size-4" />
              Back to Coaches
            </Button>
          </Link>
          <h1 className="font-bold text-3xl">{coach.user?.name || "Coach"}</h1>
          {coach.headline && <p className="mt-2 text-muted-foreground">{coach.headline}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={coach.verificationStatus ?? "pending"} />
          <StatusBadge status={coach.isActive ? "active" : "inactive"} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          disabled={coach.verificationStatus === "verified"}
          onClick={() => openDialog("verify")}
        >
          <CheckCircle className="mr-2 size-4" />
          Verify
        </Button>
        <Button
          disabled={coach.verificationStatus === "rejected"}
          onClick={() => openDialog("reject")}
          variant="outline"
        >
          <XCircle className="mr-2 size-4" />
          Reject
        </Button>
        <Button
          disabled={!coach.isActive}
          onClick={() => openDialog("takedown")}
          variant="destructive"
        >
          <Ban className="mr-2 size-4" />
          Take Down
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Bio</Label>
              <p className="mt-1 whitespace-pre-wrap">{coach.bio || "N/A"}</p>
            </div>
            <div>
              <Label>Location</Label>
              <p className="mt-1">{coach.location || "N/A"}</p>
            </div>
            {coach.yearsExperience !== undefined && (
              <div>
                <Label>Years of Experience</Label>
                <p className="mt-1">{coach.yearsExperience}</p>
              </div>
            )}
            <div>
              <Label>Specialties</Label>
              <div className="mt-1 flex flex-wrap gap-1">
                {coach.specialties?.length ? (
                  coach.specialties.map((s: string) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </div>
            </div>
            <div>
              <Label>Certifications</Label>
              <div className="mt-1 flex flex-wrap gap-1">
                {coach.certifications?.length ? (
                  coach.certifications.map((c: string) => (
                    <Badge key={c} variant="outline">
                      {c}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rates & Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Rates</Label>
              {rates.length ? (
                <ul className="mt-1 space-y-1">
                  {rates.map((r) => (
                    <li key={r.label}>
                      <span className="text-muted-foreground">{r.label}:</span> {r.value}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-muted-foreground">N/A</p>
              )}
            </div>
            <div>
              <Label>Contact Email</Label>
              <p className="mt-1">{coach.contactInfo?.email || coach.user?.email || "N/A"}</p>
            </div>
            <div>
              <Label>Contact Phone</Label>
              <p className="mt-1">{coach.contactInfo?.phone || "N/A"}</p>
            </div>
            <div>
              <Label>Rating</Label>
              <p className="mt-1">
                {coach.rating?.toFixed?.(1) ?? "0.0"} ({coach.reviewCount ?? 0} reviews)
              </p>
            </div>
            {coach.moderationNotes && (
              <div>
                <Label>Moderation Notes</Label>
                <p className="mt-1 whitespace-pre-wrap">{coach.moderationNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog onOpenChange={(open) => !open && setActiveAction(null)} open={activeAction !== null}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{activeAction && actionConfig[activeAction].title}</DialogTitle>
            <DialogDescription>
              {activeAction && actionConfig[activeAction].description}
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes..."
              rows={4}
              value={notes}
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setActiveAction(null)} variant="outline">
              Cancel
            </Button>
            <Button
              disabled={isProcessing}
              onClick={handleConfirm}
              variant={activeAction === "takedown" ? "destructive" : "default"}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Processing...
                </>
              ) : (
                (activeAction && actionConfig[activeAction].confirmLabel) || "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
