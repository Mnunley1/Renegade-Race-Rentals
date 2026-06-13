import Image from "next/image"
import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* Subtle brand glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(239,28,37,0.10),transparent_70%)]" />

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="mb-7 flex justify-center">
          <Link className="flex items-center gap-2.5 transition-opacity hover:opacity-80" href="/">
            <Image
              alt="Renegade Rentals"
              className="rounded-full"
              height={44}
              src="/logo.png"
              width={44}
            />
            <span
              className="font-bold text-foreground text-xl tracking-tight"
              style={{ fontFamily: "var(--font-header), sans-serif" }}
            >
              Renegade
            </span>
          </Link>
        </div>

        {children}
      </div>
    </div>
  )
}
