import { redirect } from "next/navigation"

// Drivers browse folded into the unified Motorsports hub.
export default function DriversPage() {
  redirect("/motorsports?view=drivers")
}
