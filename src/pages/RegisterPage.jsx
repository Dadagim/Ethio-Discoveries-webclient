import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react"
import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"

import { Logo } from "@/components/layout/Logo"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/features/auth/AuthContext"
import { getApiError, getFieldErrors } from "@/lib/errors"

const INITIAL_FORM = {
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  password: "",
  password_confirm: "",
}

const BENEFITS = [
  "A public profile for your skills and contributions",
  "Membership in scientific and problem-oriented communities",
  "A private knowledge space for your original notes",
  "A path from questions to experiments and projects",
]

export default function RegisterPage() {
  const { user, loading: authLoading, register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="size-6 text-brand-teal" />
      </div>
    )
  }

  if (user) {
    return (
      <Navigate
        to={user.email_verified ? "/home" : "/verify-email?sent=1"}
        replace
      />
    )
  }

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError("")
    setFieldErrors({})

    try {
      await register(form)
      navigate("/verify-email?sent=1", { replace: true })
    } catch (requestError) {
      setError(getApiError(requestError, "We could not create your account. Please try again."))
      setFieldErrors(getFieldErrors(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-brand-navy p-10 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -left-24 top-24 size-96 rounded-full bg-brand-teal/15 blur-3xl" />
        <div className="relative">
          <Logo />
        </div>
        <div className="relative my-auto max-w-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
            Join the ecosystem
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight">
            Start with what you are curious about.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            Your account is the beginning of a portfolio of learning, collaboration, and
            scientific work.
          </p>
          <ul className="mt-8 space-y-3">
            {BENEFITS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-white/70">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-teal" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative flex items-center gap-2 text-xs text-white/40">
          <ShieldCheck className="size-3.5" />
          Your learning entries are private unless you choose otherwise.
        </div>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-xl">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Logo tone="light" />
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>

          <div className="mt-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
              Create your account
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              Begin your knowledge journey
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              A few details now. You can add your interests, skills, and biography from your
              profile.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            {error && <Alert variant="error">{error}</Alert>}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">First name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  autoComplete="given-name"
                  value={form.first_name}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.first_name)}
                />
                {fieldErrors.first_name && (
                  <p className="text-xs text-destructive">{fieldErrors.first_name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  autoComplete="family-name"
                  value={form.last_name}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.last_name)}
                />
                {fieldErrors.last_name && (
                  <p className="text-xs text-destructive">{fieldErrors.last_name}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                autoComplete="username"
                placeholder="Choose a unique username"
                value={form.username}
                onChange={handleChange}
                required
                aria-invalid={Boolean(fieldErrors.username)}
              />
              {fieldErrors.username && (
                <p className="text-xs text-destructive">{fieldErrors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                aria-invalid={Boolean(fieldErrors.email)}
              />
              {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  aria-invalid={Boolean(fieldErrors.password)}
                />
                {fieldErrors.password && (
                  <p className="text-xs text-destructive">{fieldErrors.password}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password_confirm">Confirm password</Label>
                <Input
                  id="password_confirm"
                  name="password_confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={form.password_confirm}
                  onChange={handleChange}
                  required
                  aria-invalid={Boolean(fieldErrors.password_confirm)}
                />
                {fieldErrors.password_confirm && (
                  <p className="text-xs text-destructive">{fieldErrors.password_confirm}</p>
                )}
              </div>
            </div>

            <Button type="submit" size="lg" className="mt-2 h-11 w-full" disabled={submitting}>
              {submitting ? <Spinner /> : null}
              {submitting ? "Creating your account…" : "Create account"}
              {!submitting && <ArrowRight className="size-4" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-brand-navy underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
