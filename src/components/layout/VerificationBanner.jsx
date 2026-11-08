import { MailWarning } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/features/auth/AuthContext"
import { getApiError } from "@/lib/errors"

export default function VerificationBanner() {
  const { user, resendVerification } = useAuth()
  const [status, setStatus] = useState("idle")
  const [error, setError] = useState("")

  if (!user || user.email_verified) return null

  const handleResend = async () => {
    setStatus("sending")
    setError("")
    try {
      await resendVerification()
      setStatus("sent")
    } catch (requestError) {
      setStatus("error")
      setError(
        getApiError(
          requestError,
          "We could not send a new verification email. Please try again later."
        )
      )
    }
  }

  return (
    <div className="mb-6 rounded-2xl border border-amber-300/70 bg-amber-50 p-4 text-amber-950 shadow-xs">
      <div className="flex flex-wrap items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <MailWarning className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Verify your email to take part</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-900/80">
            You can browse, read, and edit your profile now. Publishing, commenting, and
            reacting unlock after you confirm{" "}
            <span className="font-medium">{user.email}</span>.
          </p>
          {status === "sent" && (
            <p className="mt-2 text-xs font-medium text-emerald-800">
              A new verification link is on its way. Check your inbox and spam folder.
            </p>
          )}
          {error && <p className="mt-2 text-xs font-medium text-red-700">{error}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleResend}
              disabled={status === "sending"}
            >
              {status === "sending" ? <Spinner /> : null}
              {status === "sending" ? "Sending…" : "Resend verification email"}
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/verify-email">How verification works</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
