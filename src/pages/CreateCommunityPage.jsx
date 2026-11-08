import { ArrowLeft, Building2, Globe, Layers, Lightbulb, Lock, MailWarning, Shield } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { createCommunity } from "@/api/communities"
import { PageHeader } from "@/components/layout/PageHeader"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/features/auth/AuthContext"
import { getApiError, getFieldErrors } from "@/lib/errors"
import { cn } from "@/lib/utils"

const CATEGORY_OPTIONS = [
  { value: "discipline", label: "Discipline", icon: Lightbulb },
  { value: "problem", label: "Problem area", icon: Layers },
  { value: "institution", label: "Institution", icon: Building2 },
  { value: "other", label: "Other", icon: Globe },
]

const VISIBILITY_OPTIONS = [
  {
    value: "public",
    label: "Public",
    icon: Globe,
    description: "Visible to everyone. People join immediately.",
  },
  {
    value: "restricted",
    label: "Restricted",
    icon: Shield,
    description: "Visible to everyone. Owners approve each request.",
  },
  {
    value: "private",
    label: "Private",
    icon: Lock,
    description: "Hidden from discovery. Members are added by the owner.",
  },
]

const INITIAL_FORM = {
  name: "",
  purpose: "",
  description: "",
  category: "discipline",
  visibility: "public",
}

export default function CreateCommunityPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError("")
    setFieldErrors({})

    try {
      const community = await createCommunity({
        ...form,
        name: form.name.trim(),
        purpose: form.purpose.trim(),
        description: form.description.trim(),
      })
      navigate(`/communities/${community.slug}`)
    } catch (requestError) {
      setError(getApiError(requestError, "The community could not be created."))
      setFieldErrors(getFieldErrors(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  if (!user?.email_verified) {
    return (
      <>
        <PageHeader
          eyebrow="New community"
          title="Verify your email first"
          description="Creating a community is a publishing action, so it needs a verified account."
        />
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-xs">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <MailWarning className="size-6" />
          </span>
          <h2 className="mt-4 text-base font-semibold text-foreground">
            Confirm your email to continue
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            You can join and read existing communities now. Creating one unlocks after
            verification.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button asChild size="lg">
              <Link to="/verify-email">Verification help</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/communities">Browse communities</Link>
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="New community"
        title="Create a scientific community"
        description="Give people a clear reason to gather: a discipline to advance, a problem to solve, or an institution to connect."
        actions={
          <Button asChild variant="ghost" size="lg" className="h-10 px-4">
            <Link to="/communities">
              <ArrowLeft className="size-4" />
              Back to communities
            </Link>
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <h2 className="text-base font-semibold text-foreground">Core details</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The name and purpose are what people see first.
            </p>

            {error && (
              <div className="mt-4">
                <Alert variant="error">{error}</Alert>
              </div>
            )}

            <div className="mt-5 space-y-2">
              <Label htmlFor="name">Community name</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Renewable Energy Systems"
                maxLength={120}
                required
                aria-invalid={Boolean(fieldErrors.name)}
              />
              {fieldErrors.name && (
                <p className="text-xs text-destructive">{fieldErrors.name}</p>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="purpose">Purpose statement</Label>
              <Input
                id="purpose"
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                placeholder="e.g. Make clean energy affordable for rural communities"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                One sentence that explains what this community is working toward.
              </p>
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={6}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the scope, the questions this community explores, and who should join."
                maxLength={2000}
                required
                aria-invalid={Boolean(fieldErrors.description)}
              />
              {fieldErrors.description && (
                <p className="text-xs text-destructive">{fieldErrors.description}</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <h2 className="text-base font-semibold text-foreground">Category</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Categories help people find the community in discovery.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {CATEGORY_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, category: value }))}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-4 text-left transition-colors",
                    form.category === value
                      ? "border-brand-teal bg-brand-mist/60"
                      : "border-border hover:border-brand-teal/40"
                  )}
                >
                  <span className="flex size-9 items-center justify-center rounded-lg bg-brand-navy text-white">
                    <Icon className="size-4" />
                  </span>
                  <span className="text-sm font-medium text-foreground">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <h2 className="text-base font-semibold text-foreground">Visibility</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose how people discover and join this community.
            </p>
            <div className="mt-4 space-y-3">
              {VISIBILITY_OPTIONS.map(({ value, label, icon: Icon, description }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, visibility: value }))}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                    form.visibility === value
                      ? "border-brand-teal bg-brand-mist/60"
                      : "border-border hover:border-brand-teal/40"
                  )}
                >
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-navy text-white">
                    <Icon className="size-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-foreground">{label}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                      {description}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-brand-teal/20 bg-brand-mist/50 p-5">
            <p className="text-sm font-semibold text-brand-navy">You will be the owner</p>
            <p className="mt-2 text-xs leading-relaxed text-brand-navy/70">
              As the owner you can edit the community, review join requests, and moderate members.
              You cannot leave the community until it is deleted or ownership is transferred.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <p className="text-sm font-semibold text-foreground">What makes a good community?</p>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
              <li>A specific scope rather than “science in general”.</li>
              <li>A purpose with a clear direction or intended outcome.</li>
              <li>A description that tells people how to contribute.</li>
            </ul>
          </div>

          <Button type="submit" size="lg" className="h-11 w-full" disabled={submitting}>
            {submitting ? <Spinner /> : null}
            {submitting ? "Creating community…" : "Create community"}
          </Button>
        </div>
      </form>
    </>
  )
}
