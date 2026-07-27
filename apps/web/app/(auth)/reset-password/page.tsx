import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"

export default function ResetPasswordPage() {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="text-center">
        <h1 className="mb-1 font-bold text-2xl sm:mb-2 sm:text-3xl">Reset Password</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      <Card className="border bg-card shadow-sm">
        <CardContent className="p-6">
          <div className="mb-5">
            <Link
              className="inline-flex items-center text-muted-foreground text-sm transition-colors hover:text-primary"
              href="/sign-in"
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to sign in
            </Link>
          </div>
          <form className="space-y-4 sm:space-y-6">
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-sm" htmlFor="email">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-10"
                  id="email"
                  placeholder="you@example.com"
                  required
                  type="email"
                />
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm">
                We'll send you a reset link within a few minutes
              </p>
            </div>
            <Button className="w-full" size="lg" type="submit">
              Send Reset Link
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-xs sm:text-sm">
              Remember your password?{" "}
              <Link
                className="font-medium text-primary transition-colors hover:text-primary/80"
                href="/sign-in"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <p className="px-2 text-center text-muted-foreground text-xs">
        The reset email can take a few minutes to arrive — remember to check your spam folder.
      </p>
    </div>
  )
}
