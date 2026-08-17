/**
 * When false, vehicle listing flows allow continuing without photos.
 * - Automatically off in `next dev` (NODE_ENV === "development")
 * - Or force with NEXT_PUBLIC_SKIP_REQUIRED_PHOTOS=true
 */
export function areVehiclePhotosRequired(): boolean {
  if (process.env.NEXT_PUBLIC_SKIP_REQUIRED_PHOTOS === "true") {
    return false
  }
  if (process.env.NODE_ENV === "development") {
    return false
  }
  return true
}
