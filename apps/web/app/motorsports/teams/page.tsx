import { redirect } from "next/navigation"

// Teams browse folded into the unified Motorsports hub.
export default function TeamsPage() {
  redirect("/motorsports?view=teams")
}
