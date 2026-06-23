// Canonical car-brand handling.
//
// `make` is entered as free text by hosts, so the same brand arrives spelled many
// ways ("Porsche", "porsche", "PORSCHE ", "Mercedes" vs "Mercedes-Benz"). Left raw,
// the make filter fragments into near-duplicate options that each match a sliver of
// listings. `normalizeMake` collapses every variant to one consistent display name so
// the data — and therefore the filter — behaves.
//
// This module is pure TypeScript (no Convex imports) so it can be used on both the
// server (mutations / backfill) and the client (form autocomplete).

// Manufacturers relevant to a track-day rental marketplace. Extend as needed.
export const CANONICAL_MAKES = [
  "Acura",
  "Alfa Romeo",
  "Aston Martin",
  "Audi",
  "Bentley",
  "BMW",
  "Bugatti",
  "Cadillac",
  "Chevrolet",
  "Dodge",
  "Ferrari",
  "Ford",
  "Honda",
  "Hyundai",
  "Jaguar",
  "Kia",
  "Koenigsegg",
  "Lamborghini",
  "Lancia",
  "Land Rover",
  "Lexus",
  "Lotus",
  "Maserati",
  "Mazda",
  "McLaren",
  "Mercedes-Benz",
  "Mini",
  "Mitsubishi",
  "Nissan",
  "Pagani",
  "Porsche",
  "Radical",
  "Renault",
  "Subaru",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "Volvo",
] as const

// Common aliases / shorthands / misspellings → canonical display name.
const ALIASES: Record<string, string> = {
  mercedes: "Mercedes-Benz",
  mercedesbenz: "Mercedes-Benz",
  benz: "Mercedes-Benz",
  merc: "Mercedes-Benz",
  amg: "Mercedes-Benz",
  chevy: "Chevrolet",
  chev: "Chevrolet",
  corvette: "Chevrolet",
  vw: "Volkswagen",
  volkswagon: "Volkswagen",
  bimmer: "BMW",
  beemer: "BMW",
  porche: "Porsche",
  porsha: "Porsche",
  alfa: "Alfa Romeo",
  aston: "Aston Martin",
  landrover: "Land Rover",
  rangerover: "Land Rover",
  lambo: "Lamborghini",
  mclarens: "McLaren",
}

// Normalized lookup key: lowercase, strip everything but letters/numbers.
const keyOf = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "")

const CANONICAL_BY_KEY: Record<string, string> = {}
for (const make of CANONICAL_MAKES) {
  CANONICAL_BY_KEY[keyOf(make)] = make
}
for (const [alias, canonical] of Object.entries(ALIASES)) {
  CANONICAL_BY_KEY[keyOf(alias)] = canonical
}

const toTitleCase = (s: string) =>
  s.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())

// Normalize a free-text make into a consistent brand name.
// Known brands/aliases map to their canonical form; unknown brands keep their text but
// get standardized casing/spacing so identical entries collapse into one filter option.
export function normalizeMake(raw: string | undefined | null): string {
  if (!raw) {
    return ""
  }
  const cleaned = raw.trim().replace(/\s+/g, " ")
  if (cleaned === "") {
    return ""
  }
  return CANONICAL_BY_KEY[keyOf(cleaned)] ?? toTitleCase(cleaned)
}
