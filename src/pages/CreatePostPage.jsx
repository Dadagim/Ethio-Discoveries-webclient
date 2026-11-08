import { ArrowLeft, Info, Lightbulb, MailWarning, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

import { listCommunities } from "@/api/communities"
import { createPost } from "@/api/posts"
import { PageHeader } from "@/components/layout/PageHeader"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/features/auth/AuthContext"
import { getApiError, getFieldErrors } from "@/lib/errors"
import { splitTags } from "@/lib/format"

const TYPE_OPTIONS = [
  { value: "discussion", label: "Discussion", hint: "Start an open conversation." },
  { value: "question", label: "Question", hint: "Ask something you need help with." },
  { value: "problem", label: "Problem", hint: "Describe a real-world challenge." },
  { value: "idea", label: "Idea", hint: "Share a possible solution or direction." },
  { value: "research", label: "Research", hint: "Publish a structured investigation." },
  { value: "project", label: "Project", hint: "Share work in progress or a result." },
]

const VALID_TYPES = new Set(TYPE_OPTIONS.map((option) => option.value))
const VIDEO_TYPES = new Set(["research", "project"])

export default function CreatePostPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const requestedType = searchParams.get("type")
  const requestedCommunity = searchParams.get("community")

  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    communityId: "",
    type: VALID_TYPES.has(requestedType) ? requestedType : "discussion",
    title: "",
    content: "",
    tags: "",
    videoUrl: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    listCommunities({ membership: "joined" })
      .then((data) => {
        const joined = data.results ?? []
        setCommunities(joined)
        const preferred =
          joined.find((community) => community.slug === requestedCommunity) ?? joined[0]
        if (preferred) {
          setForm((current) => ({ ...current, communityId: String(preferred.id) }))
        }
      })
      .catch(() => setCommunities([]))
      .finally(() => setLoading(false))
  }, [requestedCommunity])

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError("")
    setFieldErrors({})

    try {
      const payload = {
        community_id: Number(form.communityId),
        type: form.type,
        title: form.title.trim(),
        content: form.content.trim(),
        tags: splitTags(form.tags),
      }
      if (VIDEO_TYPES.has(form.type) && form.videoUrl.trim()) {
        payload.video_url = form.videoUrl.trim()
      }
      const post = await createPost(payload)
      navigate(`/posts/${post.id}`)
    } catch (requestError) {
      setError(getApiError(requestError, "Your contribution could not be published."))
      setFieldErrors(getFieldErrors(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
        <Spinner className="size-6 text-brand-teal" />
        <p className="text-sm">Preparing your communities…</p>
      </div>
    )
  }

  if (!user?.email_verified) {
    return (
      <>
        <PageHeader
          eyebrow="Contribution"
          title="Verify your email to publish"
          description="Publishing is limited to verified accounts so the record stays trustworthy."
        />
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-xs">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <MailWarning className="size-6" />
          </span>
          <h2 className="mt-4 text-base font-semibold text-foreground">
            Confirm {user?.email} first
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            You can browse, join communities, and keep private notes right away. Publishing
            unlocks after you open the verification link we sent you.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button asChild size="lg">
              <Link to="/verify-email">Verification help</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/feed">Back to the feed</Link>
            </Button>
          </div>
        </div>
      </>
    )
  }

  if (communities.length === 0) {
    return (
      <>
        <PageHeader
          eyebrow="Contribution"
          title="Choose a community first"
          description="Contributions live inside communities, where the right people can respond."
        />
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-mist text-brand-navy">
            <Users className="size-6" />
          </span>
          <h2 className="mt-4 text-base font-semibold text-foreground">
            You have not joined a community yet.
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Join a community to publish questions, problems, ideas, research, and projects.
          </p>
          <Button asChild size="lg" className="mt-5">
            <Link to="/communities">Explore communities</Link>
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="New contribution"
        title="Share with your community"
        description="Write something the community can respond to: a focused question, a real problem, or a piece of work in progress."
        actions={
          <Button asChild variant="ghost" size="lg" className="h-10 px-4">
            <Link to="/feed">
              <ArrowLeft className="size-4" />
              Back to feed
            </Link>
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            {error && (
              <div className="mb-4">
                <Alert variant="error">{error}</Alert>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="communityId">Community</Label>
                <select
                  id="communityId"
                  name="communityId"
                  value={form.communityId}
                  onChange={handleChange}
                  className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
                  required
                  aria-invalid={Boolean(fieldErrors.community_id)}
                >
                  {communities.map((community) => (
                    <option key={community.id} value={community.id}>
                      {community.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.community_id && (
                  <p className="text-xs text-destructive">{fieldErrors.community_id}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Contribution type</Label>
                <select
                  id="type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
                >
                  {TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Make the question or problem specific"
                maxLength={240}
                required
                aria-invalid={Boolean(fieldErrors.title)}
              />
              {fieldErrors.title && (
                <p className="text-xs text-destructive">{fieldErrors.title}</p>
              )}
              <p className="text-xs text-muted-foreground">{form.title.length}/240</p>
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                name="content"
                rows={10}
                value={form.content}
                onChange={handleChange}
                placeholder="Explain the context, what you have tried, and what kind of response would help."
                maxLength={12000}
                required
                aria-invalid={Boolean(fieldErrors.content)}
              />
              {fieldErrors.content && (
                <p className="text-xs text-destructive">{fieldErrors.content}</p>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="agriculture, sensors, energy"
              />
              <p className="text-xs text-muted-foreground">
                Separate tags with commas. They help people find related work.
              </p>
            </div>

            {VIDEO_TYPES.has(form.type) && (
              <div className="mt-4 space-y-2">
                <Label htmlFor="videoUrl">YouTube video (optional)</Label>
                <Input
                  id="videoUrl"
                  name="videoUrl"
                  type="url"
                  value={form.videoUrl}
                  onChange={handleChange}
                  placeholder="https://youtu.be/…"
                  aria-invalid={Boolean(fieldErrors.video_url)}
                />
                {fieldErrors.video_url && (
                  <p className="text-xs text-destructive">{fieldErrors.video_url}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Paste a YouTube link to a recording, demo, or walkthrough. It loads only
                  when a reader presses play.
                </p>
              </div>
            )}
          </div>

          <Button type="submit" size="lg" className="h-11 w-full" disabled={submitting}>
            {submitting ? <Spinner /> : null}
            {submitting ? "Publishing…" : "Publish contribution"}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-brand-teal/20 bg-brand-mist/50 p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
              <Lightbulb className="size-4" />
              What the community needs
            </p>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-brand-navy/70">
              <li>• A specific title rather than a vague topic.</li>
              <li>• Enough context for someone to understand the problem.</li>
              <li>• What you have already tried or considered.</li>
              <li>• The kind of help or response you are looking for.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Info className="size-4 text-brand-teal" />
              Selected type
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {TYPE_OPTIONS.find((option) => option.value === form.type)?.hint}
            </p>
          </div>
        </div>
      </form>
    </>
  )
}
