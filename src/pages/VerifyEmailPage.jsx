import { CheckCircle2, MailCheck, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { verifyEmail } from "@/api/auth"
import { Logo } from "@/components/layout/Logo"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/features/auth/AuthContext"
import { getApiError } from "@/lib/errors"

function readTokenFromHash() {
  if (typeof window === "undefined") return ""
  const hash = window.location.hash.replace(/^#/, "")
  return new URLSearchParams(hash).get("token")?.trim() ?? ""
}

export default function VerifyEmailPage() {
  const { user, refreshUser, resendVerification } = useAuth()
  const [token] = useState(readTokenFromHash)
  const [status, setStatus] = useState(token ? "verifying" : "idle")
  const [message, setMessage] = useState("")
  const [manualToken, setManualToken] = useState("")
  const [resendStatus, setResendStatus] = useState("idle")
  const [resendMessage, setResendMessage] = useState("")

  useEffect(() => {
    if (!token) return undefined

    let active = true
    verifyEmail(token)
      .then((data) => {
        if (!active) return
        setStatus("success")
        setMessage(data.detail ?? "Your email address is verified.")
        refreshUser()
      })
      .catch((requestError) => {
        if (!active) return
        setStatus("error")
        setMessage(
          getApiError(
            requestError,
            "This verification link is invalid or has expired."
          )
        )
      })

    return () => {
      active = false
    }
  }, [token, refreshUser])

  const handleManualSubmit = async (event) => {
    event.preventDefault()
    const value = manualToken.trim()
    if (!value) return
    setStatus("verifying")
    setMessage("")
    try {
      const data = await verifyEmail(value)
      setStatus("success")
      setMessage(data.detail ?? "Your email address is verified.")
      await refreshUser()
    } catch (requestError) {
      setStatus("error")
      setMessage(
        getApiError(
          requestError,
          "This verification link is invalid or has expired."
        )
      )
    }
  }

  const handleResend = async () => {
    setResendStatus("sending")
    setResendMessage("")
    try {
      await resendVerification()
      setResendStatus("sent")
      setResendMessage("A new verification link is on its way. Check your inbox and spam folder.")
    } catch (requestError) {
      setResendStatus("error")
      setResendMessage(
        getApiError(
          requestError,
          "We could not send a new verification email. Please try again later."
        )
      )
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex justify-center">
          <Logo tone="light" />
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-mist text-brand-navy">
              {status === "success" ? (
                <CheckCircle2 className="size-5 text-emerald-600" />
              ) : status === "error" ? (
                <XCircle className="size-5 text-destructive" />
              ) : (
                <MailCheck className="size-5" />
              )}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
                Email verification
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                {status === "success"
                  ? "You are verified"
                  : status === "error"
                    ? "This link did not work"
                    : token
                      ? "Checking your link"
                      : "Check your inbox"}
              </h1>
            </div>
          </div>

          {status === "verifying" && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
              <Spinner className="size-4 text-brand-teal" />
              Confirming your email address…
            </div>
          )}

          {status === "success" && (
            <>
              <Alert variant="success" className="mt-6">
                {message}
              </Alert>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Publishing, commenting, and reacting are now available on your account.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild size="lg">
                  <Link to={user ? "/home" : "/login"}>
                    {user ? "Go to your workspace" : "Sign in"}
                  </Link>
                </Button>
                {!user && (
                  <Button asChild variant="outline" size="lg">
                    <Link to="/register">Create an account</Link>
                  </Button>
                )}
              </div>
            </>
          )}

          {status === "error" && (
            <Alert variant="error" className="mt-6">
              {message}
            </Alert>
          )}

          {status !== "success" && (
            <div className="mt-6 space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {user?.email_verified
                  ? "This account is already verified. You can sign in and keep working."
                  : "Open the link from your verification email, or paste the token from that message below."}
              </p>

              {user && !user.email_verified && (
                <div className="rounded-xl border border-border bg-secondary/30 p-4">
                  <p className="text-sm font-medium text-foreground">
                    Need another email?
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    We can send a fresh link to {user.email}. Older links stop working.
                  </p>
                  {resendMessage && (
                    <p
                      className={`mt-2 text-xs font-medium ${
                        resendStatus === "error" ? "text-destructive" : "text-emerald-700"
                      }`}
                    >
                      {resendMessage}
                    </p>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    className="mt-3"
                    onClick={handleResend}
                    disabled={resendStatus === "sending"}
                  >
                    {resendStatus === "sending" ? <Spinner /> : null}
                    {resendStatus === "sending" ? "Sending…" : "Resend verification email"}
                  </Button>
                </div>
              )}

              <form onSubmit={handleManualSubmit} className="space-y-2">
                <Label htmlFor="verification-token">Verification token</Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="verification-token"
                    value={manualToken}
                    onChange={(event) => setManualToken(event.target.value)}
                    placeholder="Paste the token from your email"
                    autoComplete="off"
                  />
                  <Button
                    type="submit"
                    disabled={status === "verifying" || !manualToken.trim()}
                  >
                    Verify
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="mt-6 border-t border-border pt-4 text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
