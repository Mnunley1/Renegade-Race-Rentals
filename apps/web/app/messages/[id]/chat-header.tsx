"use client"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Archive, MoreVertical, Trash2 } from "lucide-react"
import Link from "next/link"
import { UserAvatar } from "@/components/user-avatar"

interface VehicleInfo {
  year?: number
  make?: string
  model?: string
}

interface ParticipantInfo {
  name?: string | null
}

interface CoachProfileInfo {
  _id: string
}

interface ChatHeaderProps {
  participant: ParticipantInfo | null | undefined
  vehicle: VehicleInfo | null | undefined
  coachProfile?: CoachProfileInfo | null
  isPending: boolean
  onArchive: () => void
  onDelete: () => void
}

export function ChatHeader({
  participant,
  vehicle,
  coachProfile,
  isPending,
  onArchive,
  onDelete,
}: ChatHeaderProps) {
  const name = participant?.name || "Unknown User"
  const subtitle = (() => {
    if (coachProfile) {
      return (
        <Link className="underline-offset-2 hover:underline" href={`/coaches/${coachProfile._id}`}>
          Coaching session · view coach profile
        </Link>
      )
    }
    if (vehicle) {
      return `${vehicle.year} ${vehicle.make} ${vehicle.model}`
    }
    return "Conversation"
  })()

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <UserAvatar name={name} size="md" />
        <div className="min-w-0">
          <h2 className="truncate font-semibold text-foreground">{name}</h2>
          <p className="truncate text-muted-foreground text-sm">{subtitle}</p>
        </div>
      </div>
      {!isPending && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-label="Conversation options" size="sm" variant="ghost">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onArchive}>
              <Archive className="mr-2 h-4 w-4" />
              Archive Conversation
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={onDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
