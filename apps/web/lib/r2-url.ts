/** Dev bucket used for site media; matches hardcoded URLs in marketing pages. */
const DEFAULT_DEV_R2_PUBLIC_URL = "https://pub-a50e44fe83ed433f81cb9d89aa0e106b.r2.dev"
const TRAILING_SLASH = /\/$/

function getR2PublicBase(): string | undefined {
  const fromEnv = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(TRAILING_SLASH, "")
  if (fromEnv) {
    return fromEnv
  }
  if (process.env.NODE_ENV === "development") {
    return DEFAULT_DEV_R2_PUBLIC_URL
  }
  return
}

/** Public HTTPS URL for an R2 object key. Returns "" if misconfigured or key is empty. */
export function r2Url(key: string | undefined | null): string {
  if (!key?.trim()) {
    return ""
  }

  const base = getR2PublicBase()
  if (!base) {
    return ""
  }

  const normalized = key.startsWith("/") ? key.slice(1) : key
  return `${base}/${normalized}`
}

/** Prefer R2 key, then a legacy absolute URL (e.g. Clerk avatar). */
export function resolveImageSrc(r2Key?: string | null, fallbackUrl?: string | null): string | null {
  const fromR2 = r2Key ? r2Url(r2Key) : ""
  if (fromR2) {
    return fromR2
  }

  const fallback = fallbackUrl?.trim()
  if (fallback && (fallback.startsWith("http://") || fallback.startsWith("https://"))) {
    return fallback
  }

  return null
}
