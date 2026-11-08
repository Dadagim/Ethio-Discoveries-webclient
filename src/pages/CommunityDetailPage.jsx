import {
  ArrowLeft,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  Clock,
  Globe,
  Layers,
  Lightbulb,
  Lock,
  LogOut,
  MessageSquare,
  Plus,
  Shield,
  UserPlus,
  Users,
  X,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import {
  getCommunity,
  joinCommunity,
  leaveCommunity,
  listMembers,
  reviewMembership,
} from "@/api/communities"
import { listPosts } from "@/api/posts"
import { PageHeader } from "@/components/layout/PageHeader"
import PostCard from "@/components/posts/PostCard"
import { Alert } from "@/components/ui/alert"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { getApiError } from "@/lib/errors"
import { formatDate } from "@/lib/format"

const CATEGORY_ICONS = {
  discipline: BookOpen,
  problem: Lightbulb,
  institution: Building2,
  other: Layers,
}

const VISIBILITY = {
  public: { icon: Globe, label: "Public", hint: "Anyone can join immediately." },
  restricted: { icon: Shield, label: "Restricted", hint: "Join requests need approval." },
  private: { icon: Lock, label: "Private", hint: "Only members can see this community." },
}

function MemberRow({ member, manager, onReview, busyId }) {
  const isPending = member.status === "pending"

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background/60 p-3">
      <Avatar src={member.user.avatar} name={member.user.full_name} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{member.user.full_name}</p>
        <p className="truncate text-xs text-muted-foreground">@{member.user.username}</p>
      </div>
      {isPending ? (
        manager ? (
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              className="h-8 px-2.5"
              onClick={() => onReview(member.id, "approve")}
              disabled={busyId === member.id}
            >
              <Check className="size-3.5" />
              Approve
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2.5"
              onClick={() => onReview(member.id, "reject")}
              disabled={busyId === member.id}
            >
              <X className="size-3.5" />
              Decline
            </Button>
          </div>
        ) : (
          <Badge variant="outline">Pending</Badge>
        )
      ) : (
        <Badge variant={member.role === "owner" ? "navy" : "default"}>
          {member.role_label}
        </Badge>
      )}
    </div>
  )
}

export default function CommunityDetailPage() {
  const { slug } = useParams()
  const [community, setCommunity] = useState(null)
  const [members, setMembers] = useState([])
  const [posts, setPosts] = useState([])
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionError, setActionError] = useState("")
  const [busy, setBusy] = useState(false)
  const [busyId, setBusyId] = useState(null)

  const manager = Boolean(community?.membership?.can_manage)

  const load = useCallback(async () => {
    setError("")
    try {
      const [communityData, memberData, postData] = await Promise.all([
        getCommunity(slug),
        listMembers(slug).catch(() => ({ results: [] })),
        listPosts({ community: slug }).catch(() => ({ results: [] })),
      ])
      setCommunity(communityData)
      setMembers(memberData.results ?? [])
      setPosts(postData.results ?? [])

      if (communityData?.membership?.can_manage) {
        const pendingData = await listMembers(slug, "pending").catch(() => ({
          results: [],
        }))
        setPending(pendingData.results ?? [])
      } else {
        setPending([])
      }
    } catch (requestError) {
      setError(getApiError(requestError, "This community could not be loaded."))
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    setLoading(true)
    load()
  }, [load])

  const handleJoin = async () => {
    setBusy(true)
    setActionError("")
    try {
      const result = await joinCommunity(slug)
      setCommunity(result.community)
      await load()
    } catch (requestError) {
      setActionError(getApiError(requestError, "You could not join this community."))
    } finally {
      setBusy(false)
    }
  }

  const handleLeave = async () => {
    if (!window.confirm("Leave this community? You can join again later if it is public.")) {
      return
    }
    setBusy(true)
    setActionError("")
    try {
      await leaveCommunity(slug)
      await load()
    } catch (requestError) {
      setActionError(getApiError(requestError, "You could not leave this community."))
    } finally {
      setBusy(false)
    }
  }

  const handleReview = async (membershipId, action) => {
    setBusyId(membershipId)
    setActionError("")
    try {
      await reviewMembership(slug, membershipId, action)
      await load()
    } catch (requestError) {
      setActionError(getApiError(requestError, "The request could not be reviewed."))
    } finally {
      setBusyId(null)
    }
  }

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

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
        <Spinner className="size-6 text-brand-teal" />
        <p className="text-sm">Opening community…</p>
      </div>
    )
  }

  if (error || !community) {
    return (
      <div className="py-10">
        <Alert variant="error">{error || "This community does not exist."}</Alert>
        <Button asChild variant="outline" size="lg" className="mt-4">
          <Link to="/communities">
            <ArrowLeft className="size-4" />
            Back to communities
          </Link>
        </Button>
      </div>
    )
  }

  const CategoryIcon = CATEGORY_ICONS[community.category] ?? Layers
  const visibility = VISIBILITY[community.visibility] ?? VISIBILITY.public
  const VisibilityIcon = visibility.icon
  const membership = community.membership
  const isActive = membership?.status === "active"
  const isPending = membership?.status === "pending"
  const isOwner = membership?.role === "owner"

  return (
    <>
      <Link
        to="/communities"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All communities
      </Link>

      <PageHeader
        eyebrow={community.category_label}
        title={community.name}
        description={community.purpose || community.description}
        actions={
          isOwner ? (
            <Badge variant="navy" className="px-3 py-1.5">
              <Shield className="size-3.5" />
              You own this community
            </Badge>
          ) : isActive ? (
            <Button variant="outline" size="lg" className="h-10" onClick={handleLeave} disabled={busy}>
              {busy ? <Spinner /> : <LogOut className="size-4" />}
              Leave community
            </Button>
          ) : isPending ? (
            <Button variant="outline" size="lg" className="h-10" onClick={handleLeave} disabled={busy}>
              <Clock className="size-4" />
              Cancel request
            </Button>
          ) : (
            <Button size="lg" className="h-10 px-4" onClick={handleJoin} disabled={busy}>
              {busy ? <Spinner /> : <UserPlus className="size-4" />}
              {community.visibility === "public" ? "Join community" : "Request to join"}
            </Button>
          )
        }
      />

      {actionError && (
        <div className="mb-5">
          <Alert variant="error">{actionError}</Alert>
        </div>
      )}

      {isPending && (
        <div className="mb-5">
          <Alert variant="info">
            Your request is waiting for a moderator or the owner to review it.
          </Alert>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-start gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-mist text-brand-navy">
                <CategoryIcon className="size-6" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="teal">{community.category_label}</Badge>
                  <Badge variant="outline" className="gap-1">
                    <VisibilityIcon className="size-3" />
                    {visibility.label}
                  </Badge>
                  {manager && <Badge variant="navy">You manage this</Badge>}
                </div>
                <h2 className="mt-3 text-lg font-semibold tracking-tight text-foreground">
                  About this community
                </h2>
              </div>
            </div>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {community.description}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Community contributions
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {posts.length} {posts.length === 1 ? "contribution" : "contributions"}
                </p>
              </div>
              {isActive ? (
                <Button asChild size="sm" className="h-9">
                  <Link to={`/posts/new?community=${community.slug}`}>
                    <Plus className="size-3.5" />
                    Start a discussion
                  </Link>
                </Button>
              ) : (
                <Badge variant="outline">Join to contribute</Badge>
              )}
            </div>

            {posts.length > 0 ? (
              <div className="mt-4 space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    showCommunity={false}
                    onReact={handleReact}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-border bg-background/50 p-6 text-center">
                <span className="mx-auto flex size-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                  <MessageSquare className="size-5" />
                </span>
                <h3 className="mt-3 text-sm font-semibold text-foreground">
                  No contributions yet
                </h3>
                <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">
                  Start the first discussion, question, or problem for this community.
                </p>
                {isActive && (
                  <Button asChild size="sm" className="mt-4">
                    <Link to={`/posts/new?community=${community.slug}`}>
                      <Plus className="size-3.5" />
                      Start a discussion
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">Members</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {community.member_count} active{" "}
                  {community.member_count === 1 ? "member" : "members"}
                </p>
              </div>
              <span className="flex size-9 items-center justify-center rounded-lg bg-brand-mist text-brand-navy">
                <Users className="size-4" />
              </span>
            </div>

            {members.length > 0 ? (
              <div className="mt-4 space-y-2">
                {members.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    manager={manager}
                    onReview={handleReview}
                    busyId={busyId}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Member information is only visible to active members.
              </p>
            )}
          </div>

          {manager && (
            <div className="rounded-2xl border border-brand-teal/25 bg-brand-mist/40 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-brand-navy">Join requests</h2>
                  <p className="mt-0.5 text-xs text-brand-navy/60">
                    Review people waiting to join this community.
                  </p>
                </div>
                <Badge variant="navy">{pending.length} pending</Badge>
              </div>

              {pending.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {pending.map((member) => (
                    <MemberRow
                      key={member.id}
                      member={member}
                      manager
                      onReview={handleReview}
                      busyId={busyId}
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-brand-navy/60">
                  No pending requests right now.
                </p>
              )}
            </div>
          )}

        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <h2 className="text-sm font-semibold text-foreground">Community details</h2>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Owner
                </dt>
                <dd className="mt-1.5 flex items-center gap-2 text-sm text-foreground">
                  <Avatar
                    src={community.owner.avatar}
                    name={community.owner.full_name}
                    size="sm"
                  />
                  <span className="min-w-0">
                    <span className="block truncate">{community.owner.full_name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      @{community.owner.username}
                    </span>
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Visibility
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {visibility.label}
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {visibility.hint}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  <CalendarDays className="size-3.5" />
                  Created
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {formatDate(community.created_at)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-brand-teal/20 bg-brand-mist/50 p-5">
            <p className="text-sm font-semibold text-brand-navy">Why communities matter</p>
            <p className="mt-2 text-xs leading-relaxed text-brand-navy/70">
              A community is where a private learning note can become a shared question, and a
              shared question can become a problem worth investigating together.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
