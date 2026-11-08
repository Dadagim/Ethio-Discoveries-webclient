import { ArrowLeft, ArrowRight, Atom, BookOpen, ShieldCheck, Users } from "lucide-react"
import { useState } from "react"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"

import { Logo } from "@/components/layout/Logo"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/features/auth/AuthContext"
import { getApiError } from "@/lib/errors"

const SIDE_POINTS = [
  { icon: Users, text: "Join scientific communities across disciplines and problem areas." },
  { icon: BookOpen, text: "Turn what you learn into a private, organised knowledge space." },
  { icon: Atom, text: "Connect problems, experiments, and projects in one ecosystem." },
]

export default function LoginPage() {
  const { user, loading: authLoading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ identifier: "", password: "" })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="size-6 text-brand-teal" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/home" replace />
  }

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      await login(form)
      navigate(location.state?.from || "/home", { replace: true })
    } catch (requestError) {
      setError(getApiError(requestError, "We could not sign you in. Please try again."))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.02fr_0.98fr]">
      <aside className="relative hidden overflow-hidden bg-brand-navy p-10 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -right-24 top-16 size-96 rounded-full bg-brand-teal/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-white/5 blur-3xl" />
        <div className="relative">
          <Logo />
        </div>
        <div className="relative my-auto max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
            Scientific Innovation & Knowledge Ecosystem
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight">
            The distance between learning something and building something useful is smaller
            when people work together.
          </h2>
          <div className="mt-8 space-y-4">
            {SIDE_POINTS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/8 text-brand-teal">
                  <Icon className="size-4" />
                </span>
                <p className="text-sm leading-relaxed text-white/65">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative flex items-center gap-2 text-xs text-white/40">
          <ShieldCheck className="size-3.5" />
          Private knowledge stays private by default.
        </div>
      </aside>

      <main className="flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
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
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
              Welcome back
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              Sign in to your workspace
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Continue discovering communities, discussions, and problems worth solving.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && <Alert variant="error">{error}</Alert>}

            <div className="space-y-2">
              <Label htmlFor="identifier">Username or email</Label>
              <Input
                id="identifier"
                name="identifier"
                autoComplete="username"
                placeholder="amina or amina@example.com"
                value={form.identifier}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" size="lg" className="h-11 w-full" disabled={submitting}>
              {submitting ? <Spinner /> : null}
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to ETPM?{" "}
            <Link to="/register" className="font-medium text-brand-navy underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
          <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-brand-teal" />
            Session-protected workspace
          </div>
        </div>
      </main>
    </div>
  )
}
