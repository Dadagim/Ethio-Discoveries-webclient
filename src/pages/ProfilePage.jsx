import { CalendarDays, Edit3, Mail, MapPin, Save, UserRound, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { listCommunities } from "@/api/communities"
import { listPosts } from "@/api/posts"
import { PageHeader } from "@/components/layout/PageHeader"
import { Alert } from "@/components/ui/alert"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/features/auth/AuthContext"
import { getApiError } from "@/lib/errors"
import { formatMonthYear, formatRelativeTime, splitTags } from "@/lib/format"

function makeForm(user) {
  return {
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    institution: user?.institution || "",
    location: user?.location || "",
    bio: user?.bio || "",
    interests: (user?.interest_names || []).join(", "),
    skills: (user?.skill_names || []).join(", "),
  }
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(makeForm(user))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [posts, setPosts] = useState([])
  const [communities, setCommunities] = useState([])
  const [portfolioLoading, setPortfolioLoading] = useState(true)

  useEffect(() => {
    setForm(makeForm(user))
  }, [user])

  useEffect(() => {
    if (!user) return
    let active = true
    setPortfolioLoading(true)

    Promise.all([
      listPosts({ author: user.username }).catch(() => ({ results: [] })),
      listCommunities({ membership: "joined" }).catch(() => ({ results: [] })),
    ])
      .then(([postData, communityData]) => {
        if (!active) return
        setPosts(postData.results ?? [])
        setCommunities(communityData.results ?? [])
      })
      .finally(() => {
        if (active) setPortfolioLoading(false)
      })

    return () => {
      active = false
    }
  }, [user])

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const startEditing = () => {
    setForm(makeForm(user))
    setError("")
    setSuccess("")
    setEditing(true)
  }

  const cancelEditing = () => {
    setEditing(false)
    setError("")
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError("")

    try {
      await updateProfile({
        ...form,
        interests: splitTags(form.interests),
        skills: splitTags(form.skills),
      })
      setEditing(false)
      setSuccess("Your profile has been updated.")
    } catch (requestError) {
      setError(getApiError(requestError, "Your profile could not be saved."))
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  const displayName = user.full_name || user.username
  const interests = user.interest_names || []
  const skills = user.skill_names || []

  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title="My profile"
        description="Your profile will become a portfolio of your knowledge, collaborations, and scientific contributions."
        actions={
          !editing ? (
            <Button variant="outline" size="lg" className="h-10 px-4" onClick={startEditing}>
              <Edit3 className="size-4" />
              Edit profile
            </Button>
          ) : (
            <Button variant="ghost" size="lg" className="h-10 px-4" onClick={cancelEditing}>
              <X className="size-4" />
              Cancel
            </Button>
          )
        }
      />

      {success && (
        <div className="mb-6">
          <Alert variant="success">{success}</Alert>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar src={user.avatar} name={displayName} size="xl" className="ring-4 ring-brand-mist" />
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">{displayName}</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">@{user.username}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  {user.institution && (
                    <span className="inline-flex items-center gap-1.5">
                      <UserRound className="size-3.5" />
                      {user.institution}
                    </span>
                  )}
                  {user.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-3.5" />
                      {user.location}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" />
                    Joined {formatMonthYear(user.created_at)}
                  </span>
                </div>
              </div>
              <Badge variant="teal">Phase 1 member</Badge>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">Edit profile</h2>
                <p className="text-xs text-muted-foreground">Only you can edit this information.</p>
              </div>

              {error && (
                <div className="mt-4">
                  <Alert variant="error">{error}</Alert>
                </div>
              )}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institution">Institution or affiliation</Label>
                  <Input
                    id="institution"
                    name="institution"
                    placeholder="University, organisation, or independent"
                    value={form.institution}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="City or country"
                    value={form.location}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="bio">Biography</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  placeholder="What are you learning, researching, or building?"
                  value={form.bio}
                  onChange={handleChange}
                />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="interests">Areas of interest</Label>
                  <Input
                    id="interests"
                    name="interests"
                    placeholder="Agriculture, Electronics, Public health"
                    value={form.interests}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-muted-foreground">Separate tags with commas.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills</Label>
                  <Input
                    id="skills"
                    name="skills"
                    placeholder="Python, Circuit design, Data analysis"
                    value={form.skills}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-muted-foreground">Separate skills with commas.</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="ghost" size="lg" onClick={cancelEditing}>
                  Cancel
                </Button>
                <Button type="submit" size="lg" disabled={saving}>
                  {saving ? <Spinner /> : <Save className="size-4" />}
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                <h2 className="text-base font-semibold text-foreground">About</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {user.bio || "You have not added a biography yet. Use Edit profile to describe what you are learning or building."}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                <h2 className="text-base font-semibold text-foreground">Interests and skills</h2>
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Areas of interest
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {interests.length > 0 ? (
                        interests.map((interest) => (
                          <Badge key={interest} variant="teal">
                            {interest}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No interests added yet.</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Skills
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {skills.length > 0 ? (
                        skills.map((skill) => (
                          <Badge key={skill} variant="default">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No skills added yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-foreground">
                    Published contributions
                  </h2>
                  <Badge variant="outline">{posts.length}</Badge>
                </div>
                {portfolioLoading ? (
                  <div className="flex justify-center py-5">
                    <Spinner className="size-5 text-brand-teal" />
                  </div>
                ) : posts.length > 0 ? (
                  <ul className="mt-4 space-y-3">
                    {posts.slice(0, 6).map((post) => (
                      <li key={post.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                        <Link
                          to={`/posts/${post.id}`}
                          className="text-sm font-medium text-foreground transition-colors hover:text-brand-navy"
                        >
                          {post.title}
                        </Link>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                          <span className="font-medium text-brand-navy">{post.type_label}</span>
                          <span aria-hidden="true">·</span>
                          <span>{post.community.name}</span>
                          <span aria-hidden="true">·</span>
                          <span>{formatRelativeTime(post.created_at)}</span>
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Nothing published yet. Join a community and share a question, problem, or idea
                    to begin your contribution record.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-foreground">Joined communities</h2>
                  <Badge variant="outline">{communities.length}</Badge>
                </div>
                {portfolioLoading ? (
                  <div className="flex justify-center py-5">
                    <Spinner className="size-5 text-brand-teal" />
                  </div>
                ) : communities.length > 0 ? (
                  <ul className="mt-4 space-y-3">
                    {communities.map((community) => (
                      <li
                        key={community.id}
                        className="flex items-center justify-between gap-2 border-b border-border pb-3 last:border-0 last:pb-0"
                      >
                        <Link
                          to={`/communities/${community.slug}`}
                          className="min-w-0 truncate text-sm font-medium text-foreground transition-colors hover:text-brand-navy"
                        >
                          {community.name}
                        </Link>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {community.member_count}{" "}
                          {community.member_count === 1 ? "member" : "members"}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    You have not joined a community yet. Discover communities working on your
                    discipline or the problem that interests you.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <h2 className="text-sm font-semibold text-foreground">Account details</h2>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  <Mail className="size-3.5" />
                  Email
                </dt>
                <dd className="mt-1 break-all text-sm text-foreground">{user.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Username
                </dt>
                <dd className="mt-1 text-sm text-foreground">@{user.username}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Member since
                </dt>
                <dd className="mt-1 text-sm text-foreground">{formatMonthYear(user.created_at)}</dd>
              </div>
            </dl>
            <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
              Your email is not shown on public contributions. Only your username and profile are
              public.
            </p>
          </div>

          <div className="rounded-2xl border border-brand-teal/20 bg-brand-mist/50 p-5">
            <p className="text-sm font-semibold text-brand-navy">Why this matters</p>
            <p className="mt-2 text-xs leading-relaxed text-brand-navy/70">
              In Phase 2 this page becomes a portfolio: contribution history, research, projects,
              collaboration records, and verified achievements—not just a list of likes.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
