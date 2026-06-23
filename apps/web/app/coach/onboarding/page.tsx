"use client"

import { useUser } from "@clerk/nextjs"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"
import { useMutation, useQuery } from "convex/react"
import { ArrowLeft, Loader2, Plus, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/convex"
import { handleErrorWithContext } from "@/lib/error-handler"

type RacingType = "real-world" | "sim-racing" | "both"

function dollarsToCents(value: string): number | undefined {
  const trimmed = value.trim()
  if (!trimmed) return
  const num = Number.parseFloat(trimmed)
  if (Number.isNaN(num) || num <= 0) return
  return Math.round(num * 100)
}

function centsToDollars(cents?: number): string {
  if (cents === undefined) return ""
  return (cents / 100).toString()
}

function ChipInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string
  values: string[]
  onChange: (next: string[]) => void
  placeholder: string
}) {
  const [draft, setDraft] = useState("")

  const add = () => {
    const v = draft.trim()
    if (!v) return
    if (values.includes(v)) {
      setDraft("")
      return
    }
    onChange([...values, v])
    setDraft("")
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              add()
            }
          }}
          placeholder={placeholder}
          value={draft}
        />
        <Button onClick={add} type="button" variant="outline">
          <Plus className="size-4" />
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {values.map((v) => (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-secondary-foreground text-sm"
              key={v}
            >
              {v}
              <button
                aria-label={`Remove ${v}`}
                className="hover:text-destructive"
                onClick={() => onChange(values.filter((x) => x !== v))}
                type="button"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CoachOnboardingPage() {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useUser()
  const existing = useQuery(api.coachProfiles.getByUser)
  const createProfile = useMutation(api.coachProfiles.create)
  const updateProfile = useMutation(api.coachProfiles.update)

  const [headline, setHeadline] = useState("")
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [yearsExperience, setYearsExperience] = useState<string>("")
  const [racingType, setRacingType] = useState<RacingType | "unset">("unset")
  const [specialties, setSpecialties] = useState<string[]>([])
  const [certifications, setCertifications] = useState<string[]>([])
  const [tracks, setTracks] = useState<string[]>([])
  const [hourlyRate, setHourlyRate] = useState("")
  const [halfDayRate, setHalfDayRate] = useState("")
  const [fullDayRate, setFullDayRate] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [instagram, setInstagram] = useState("")
  const [website, setWebsite] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (!hydrated && existing) {
      setHeadline(existing.headline ?? "")
      setBio(existing.bio)
      setLocation(existing.location)
      setYearsExperience(existing.yearsExperience?.toString() ?? "")
      setRacingType(existing.racingType ?? "unset")
      setSpecialties(existing.specialties)
      setCertifications(existing.certifications ?? [])
      setTracks(existing.tracksCoachedAt ?? [])
      setHourlyRate(centsToDollars(existing.hourlyRate))
      setHalfDayRate(centsToDollars(existing.halfDayRate))
      setFullDayRate(centsToDollars(existing.fullDayRate))
      setContactEmail(existing.contactInfo?.email ?? "")
      setContactPhone(existing.contactInfo?.phone ?? "")
      setInstagram(existing.socialLinks?.instagram ?? "")
      setWebsite(existing.socialLinks?.website ?? "")
      setHydrated(true)
    }
  }, [existing, hydrated])

  if (isLoaded && !isSignedIn) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-bold text-2xl">Sign in to become a coach</h1>
        <p className="mt-2 text-muted-foreground">
          You'll need an account to advertise your coaching services.
        </p>
        <Button asChild className="mt-6">
          <Link href="/sign-in?redirect_url=/coach/onboarding">Sign in</Link>
        </Button>
      </div>
    )
  }

  const isEdit = !!existing

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!(bio.trim() && location.trim() && specialties.length > 0)) {
      toast.error("Bio, location, and at least one specialty are required")
      return
    }

    const hourly = dollarsToCents(hourlyRate)
    const halfDay = dollarsToCents(halfDayRate)
    const fullDay = dollarsToCents(fullDayRate)
    if (!(hourly || halfDay || fullDay)) {
      toast.error("Set at least one rate (hourly, half-day, or full-day)")
      return
    }

    const contactInfo =
      contactEmail.trim() || contactPhone.trim()
        ? {
            email: contactEmail.trim() || undefined,
            phone: contactPhone.trim() || undefined,
          }
        : undefined

    const socialLinks =
      instagram.trim() || website.trim()
        ? {
            instagram: instagram.trim() || undefined,
            website: website.trim() || undefined,
          }
        : undefined

    const yearsNum = yearsExperience.trim() ? Number.parseInt(yearsExperience, 10) : undefined

    setSubmitting(true)
    try {
      if (isEdit) {
        await updateProfile({
          profileId: existing._id,
          headline: headline.trim() || undefined,
          bio,
          location,
          yearsExperience: yearsNum,
          racingType: racingType === "unset" ? undefined : racingType,
          specialties,
          certifications: certifications.length > 0 ? certifications : undefined,
          tracksCoachedAt: tracks.length > 0 ? tracks : undefined,
          hourlyRate: hourly,
          halfDayRate: halfDay,
          fullDayRate: fullDay,
          contactInfo,
          socialLinks,
        })
        toast.success("Coach profile updated")
      } else {
        await createProfile({
          headline: headline.trim() || undefined,
          bio,
          location,
          yearsExperience: yearsNum,
          racingType: racingType === "unset" ? undefined : racingType,
          specialties,
          certifications: certifications.length > 0 ? certifications : undefined,
          tracksCoachedAt: tracks.length > 0 ? tracks : undefined,
          hourlyRate: hourly,
          halfDayRate: halfDay,
          fullDayRate: fullDay,
          contactInfo,
          socialLinks,
        })
        toast.success("Coach profile created")
      }
      router.push("/coach/dashboard")
    } catch (err) {
      handleErrorWithContext(err, { action: "save coach profile", entity: "coach" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Link className="mb-4 inline-block" href={isEdit ? "/coach/dashboard" : "/coaches"}>
        <Button size="sm" variant="ghost">
          <ArrowLeft className="mr-2 size-4" />
          Back
        </Button>
      </Link>

      <h1 className="mb-2 font-bold text-3xl tracking-tight">
        {isEdit ? "Edit your coach profile" : "Become a coach"}
      </h1>
      <p className="mb-8 text-muted-foreground">
        {isEdit
          ? "Update your coaching profile and rates."
          : "Tell drivers about your coaching experience and set your rates."}
      </p>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>About you</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                maxLength={120}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. SCCA-licensed instructor, GT3 specialist"
                value={headline}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio *</Label>
              <Textarea
                id="bio"
                maxLength={2000}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your coaching philosophy, racing background, and what drivers can expect."
                required
                rows={5}
                value={bio}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State"
                  required
                  value={location}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="years">Years of experience</Label>
                <Input
                  id="years"
                  inputMode="numeric"
                  onChange={(e) => setYearsExperience(e.target.value)}
                  placeholder="e.g. 8"
                  value={yearsExperience}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Racing type</Label>
              <Select
                onValueChange={(v) => setRacingType(v as RacingType | "unset")}
                value={racingType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose racing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unset">Not specified</SelectItem>
                  <SelectItem value="real-world">Real-World</SelectItem>
                  <SelectItem value="sim-racing">Sim Racing</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Specialties & credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChipInput
              label="Specialties * (e.g. HPDE, GT3, Karting, Time Attack)"
              onChange={setSpecialties}
              placeholder="Add a specialty and press Enter"
              values={specialties}
            />
            <ChipInput
              label="Certifications"
              onChange={setCertifications}
              placeholder="e.g. SCCA Licensed Instructor"
              values={certifications}
            />
            <ChipInput
              label="Tracks you coach at"
              onChange={setTracks}
              placeholder="e.g. Circuit of the Americas"
              values={tracks}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rates</CardTitle>
            <p className="text-muted-foreground text-sm">
              Set at least one. Drivers will see the rates you fill in.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="hourly">Hourly ($)</Label>
              <Input
                id="hourly"
                inputMode="decimal"
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="150"
                value={hourlyRate}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="half">Half-day ($)</Label>
              <Input
                id="half"
                inputMode="decimal"
                onChange={(e) => setHalfDayRate(e.target.value)}
                placeholder="500"
                value={halfDayRate}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="full">Full-day ($)</Label>
              <Input
                id="full"
                inputMode="decimal"
                onChange={(e) => setFullDayRate(e.target.value)}
                placeholder="900"
                value={fullDayRate}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact & social</CardTitle>
            <p className="text-muted-foreground text-sm">
              Optional. Drivers can always reach you through Renegade's messaging.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="you@example.com"
                type="email"
                value={contactEmail}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="555-555-5555"
                type="tel"
                value={contactPhone}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@handle"
                value={instagram}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
                value={website}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button asChild type="button" variant="outline">
            <Link href={isEdit ? "/coach/dashboard" : "/coaches"}>Cancel</Link>
          </Button>
          <Button disabled={submitting} type="submit">
            {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isEdit ? "Save changes" : "Create profile"}
          </Button>
        </div>
      </form>
    </div>
  )
}
