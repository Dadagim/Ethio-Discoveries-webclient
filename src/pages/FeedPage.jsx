import { Compass, Filter, Plus, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { listCommunities } from "@/api/communities"
import { listPosts } from "@/api/posts"
import { PageHeader } from "@/components/layout/PageHeader"
import PostCard from "@/components/posts/PostCard"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { getApiError } from "@/lib/errors"

const TYPE_LABELS = {
  discussion: "Discussion",
  question: "Question",
  problem: "Problem",
  idea: "Idea",
  research: "Research",
  project: "Project",
}

const DEFAULT_TYPES = []

export default function FeedPage({
  eyebrow = "Feed",
  title = "Community feed",
  description = "Follow the questions, problems, and projects emerging across your communities.",
  types = DEFAULT_TYPES,
  createLabel = "Start a post",
}) {
  const typesKey = types.join(",")
  const [posts, setPosts] = useState([])
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [community, setCommunity] = useState("")
  const [typeFilter, setTypeFilter] = useState("")

  useEffect(() => {
    listCommunities()
      .then((data) => setCommunities(data.results ?? []))
      .catch(() => setCommunities([]))
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError("")

    const timer = setTimeout(() => {
      const baseTypes = typesKey ? typesKey.split(",") : []
      const selectedTypes = typeFilter ? [typeFilter] : baseTypes
      listPosts({
        search: search || undefined,
        community: community || undefined,
        type: selectedTypes.length ? selectedTypes.join(",") : undefined,
      })
        .then((data) => {
          if (!active) return
          setPosts(data.results ?? [])
        })
        .catch((requestError) => {
          if (!active) return
          setError(getApiError(requestError, "The feed could not be loaded."))
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 250)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [search, community, typeFilter, typesKey])

  const handleReact = (postId, result) => {
    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? {
              ...post,
              reaction_summary: result.reaction_summary,
              my_reaction: result.my_reaction,
              reaction_count: result.reaction_count,
            }
          : post
      )
    )
  }

  const typeOptions = types.length > 0 ? types : Object.keys(TYPE_LABELS)
  const createParams = new URLSearchParams()
  if (typeFilter || types[0]) createParams.set("type", typeFilter || types[0])
  if (community) createParams.set("community", community)
  const createHref = `/posts/new${createParams.toString() ? `?${createParams}` : ""}`

  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={
          <Button asChild size="lg" className="h-10 px-4">
            <Link to={createHref}>
              <Plus className="size-4" />
              {createLabel}
            </Link>
          </Button>
        }
      />

      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search titles and content"
              className="pl-10"
              aria-label="Search posts"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <select
                value={community}
                onChange={(event) => setCommunity(event.target.value)}
                className="h-11 rounded-lg border border-input bg-background pl-9 pr-8 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
                aria-label="Filter by community"
              >
                <option value="">All communities</option>
                {communities.map((item) => (
                  <option key={item.id} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {typeOptions.length > 1 && (
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
                aria-label="Filter by post type"
              >
                <option value="">All types</option>
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {TYPE_LABELS[type] ?? type}
                  </option>
                ))}
              </select>
            )}
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
          <p className="text-sm">Loading contributions…</p>
        </div>
      ) : posts.length > 0 ? (
        <div className="mt-6 space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onReact={handleReact} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-mist text-brand-navy">
            <Compass className="size-6" />
          </span>
          <h2 className="mt-4 text-base font-semibold text-foreground">
            Nothing here yet.
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            The first contribution starts the conversation. Share a question, a problem, or an idea
            with one of your communities.
          </p>
          <Button asChild size="lg" className="mt-5">
            <Link to={createHref}>
              <Plus className="size-4" />
              {createLabel}
            </Link>
          </Button>
        </div>
      )}
    </>
  )
}
