import {
  ArrowRight,
  BookOpen,
  Building2,
  Compass,
  Globe,
  Layers,
  Lightbulb,
  Lock,
  Plus,
  Search,
  Shield,
  Users,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { listCommunities } from "@/api/communities"
import { PageHeader } from "@/components/layout/PageHeader"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { getApiError } from "@/lib/errors"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  { value: "", label: "All categories" },
  { value: "discipline", label: "Discipline" },
  { value: "problem", label: "Problem area" },
  { value: "institution", label: "Institution" },
  { value: "other", label: "Other" },
]

const CATEGORY_ICONS = {
  discipline: BookOpen,
  problem: Lightbulb,
  institution: Building2,
  other: Layers,
}

const VISIBILITY = {
  public: { icon: Globe, label: "Public", hint: "Anyone can join" },
  restricted: { icon: Shield, label: "Restricted", hint: "Approval required" },
  private: { icon: Lock, label: "Private", hint: "Members only" },
}

function CommunityCard({ community }) {
  const CategoryIcon = CATEGORY_ICONS[community.category] ?? Layers
  const visibility = VISIBILITY[community.visibility] ?? VISIBILITY.public
  const VisibilityIcon = visibility.icon
  const membership = community.membership

  return (
    <Link
      to={`/communities/${community.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-brand-teal/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-brand-mist text-brand-navy">
          <CategoryIcon className="size-5" />
        </span>
        <div className="flex flex-wrap justify-end gap-1.5">
          <Badge variant="outline" className="gap-1">
            <VisibilityIcon className="size-3" />
            {visibility.label}
          </Badge>
          {membership?.status === "active" && (
            <Badge variant="success">{membership.role_label}</Badge>
          )}
          {membership?.status === "pending" && (
            <Badge variant="outline">Pending</Badge>
          )}
        </div>
      </div>

      <h2 className="mt-4 text-base font-semibold tracking-tight text-foreground">
        {community.name}
      </h2>
      <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-brand-teal">
        {community.category_label}
      </p>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {community.purpose || community.description}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="size-3.5" />
          {community.member_count} {community.member_count === 1 ? "member" : "members"}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-navy transition-colors group-hover:text-brand-teal">
          Open
          <ArrowRight className="size-3.5" />
        </span>
      </div>
    </Link>
  )
}

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [scope, setScope] = useState("all")

  useEffect(() => {
    let active = true
    setLoading(true)
    setError("")

    const timer = setTimeout(() => {
      listCommunities({
        search: search || undefined,
        category: category || undefined,
        membership: scope === "joined" ? "joined" : undefined,
      })
        .then((data) => {
          if (!active) return
          setCommunities(data.results ?? [])
        })
        .catch((requestError) => {
          if (!active) return
          setError(getApiError(requestError, "Communities could not be loaded."))
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 250)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [search, category, scope])

  return (
    <>
      <PageHeader
        eyebrow="Communities"
        title="Scientific communities"
        description="Find the people working on your discipline, the problem that keeps you curious, or the institution you belong to."
        actions={
          <Button asChild size="lg" className="h-10 px-4">
            <Link to="/communities/new">
              <Plus className="size-4" />
              Create community
            </Link>
          </Button>
        }
      />

      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search communities by name, purpose, or description"
              className="pl-10"
              aria-label="Search communities"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
              aria-label="Filter by category"
            >
              {CATEGORIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="inline-flex rounded-lg bg-secondary p-1">
              {[
                { value: "all", label: "Discover" },
                { value: "joined", label: "My communities" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setScope(option.value)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    scope === option.value
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-5">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {loading ? (
        <div className="mt-10 flex flex-col items-center gap-3 text-muted-foreground">
          <Spinner className="size-6 text-brand-teal" />
          <p className="text-sm">Loading communities…</p>
        </div>
      ) : communities.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {communities.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-mist text-brand-navy">
            {scope === "joined" ? <Users className="size-6" /> : <Compass className="size-6" />}
          </span>
          <h2 className="mt-4 text-base font-semibold text-foreground">
            {scope === "joined"
              ? "You have not joined a community yet."
              : "No communities match your search."}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            {scope === "joined"
              ? "Explore the discovery view and join a community that matches your work."
              : "Try a different search term or category—or create the community you are looking for."}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {scope === "joined" && (
              <Button variant="outline" size="lg" onClick={() => setScope("all")}>
                Explore communities
              </Button>
            )}
            <Button asChild size="lg">
              <Link to="/communities/new">
                <Plus className="size-4" />
                Create community
              </Link>
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
