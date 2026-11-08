import { ArrowLeft, MailWarning, MessageCircle, Pin, Send, Trash2, Users } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import {
  createComment,
  deleteComment,
  deletePost,
  getPost,
  listComments,
} from "@/api/posts"
import { PageHeader } from "@/components/layout/PageHeader"
import CommentItem from "@/components/posts/CommentItem"
import ExternalVideoPlayer from "@/components/posts/ExternalVideoPlayer"
import ReactionBar from "@/components/posts/ReactionBar"
import { Alert } from "@/components/ui/alert"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/features/auth/AuthContext"
import { getApiError } from "@/lib/errors"
import { formatDate, formatRelativeTime } from "@/lib/format"

const TYPE_VARIANTS = {
  discussion: "default",
  question: "teal",
  problem: "navy",
  idea: "success",
  research: "navy",
  project: "teal",
}

export default function PostDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionError, setActionError] = useState("")
  const [commentBody, setCommentBody] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [busyCommentId, setBusyCommentId] = useState(null)
  const [deletingPost, setDeletingPost] = useState(false)

  const loadComments = useCallback(async () => {
    const data = await listComments(id)
    setComments(data.results ?? [])
    return data.count ?? 0
  }, [id])

  const load = useCallback(async () => {
    setError("")
    try {
      const [postData, commentData] = await Promise.all([
        getPost(id),
        listComments(id),
      ])
      setPost(postData)
      setComments(commentData.results ?? [])
    } catch (requestError) {
      setError(getApiError(requestError, "This contribution could not be loaded."))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    setLoading(true)
    load()
  }, [load])

  const handleReact = (result) => {
    setPost((current) =>
      current
        ? {
            ...current,
            reaction_summary: result.reaction_summary,
            my_reaction: result.my_reaction,
            reaction_count: result.reaction_count,
          }
        : current
    )
  }

  const handleComment = async (event) => {
    event.preventDefault()
    if (!commentBody.trim()) return
    setSubmitting(true)
    setActionError("")
    try {
      await createComment(id, { body: commentBody.trim() })
      setCommentBody("")
      const count = await loadComments()
      setPost((current) => (current ? { ...current, comment_count: count } : current))
    } catch (requestError) {
      setActionError(getApiError(requestError, "Your comment could not be posted."))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = async (commentId, body) => {
    setActionError("")
    try {
      await createComment(id, { body, parent_id: commentId })
      const count = await loadComments()
      setPost((current) => (current ? { ...current, comment_count: count } : current))
      return true
    } catch (requestError) {
      setActionError(getApiError(requestError, "Your reply could not be posted."))
      return false
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return
    setBusyCommentId(commentId)
    setActionError("")
    try {
      await deleteComment(commentId)
      const count = await loadComments()
      setPost((current) => (current ? { ...current, comment_count: count } : current))
    } catch (requestError) {
      setActionError(getApiError(requestError, "The comment could not be deleted."))
    } finally {
      setBusyCommentId(null)
    }
  }

  const handleDeletePost = async () => {
    if (!window.confirm("Delete this contribution? This cannot be undone.")) return
    setDeletingPost(true)
    setActionError("")
    try {
      const slug = post.community.slug
      await deletePost(post.id)
      navigate(`/communities/${slug}`)
    } catch (requestError) {
      setActionError(getApiError(requestError, "The contribution could not be deleted."))
      setDeletingPost(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
        <Spinner className="size-6 text-brand-teal" />
        <p className="text-sm">Opening contribution…</p>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="py-10">
        <Alert variant="error">{error || "This contribution does not exist."}</Alert>
        <Button asChild variant="outline" size="lg" className="mt-4">
          <Link to="/feed">
            <ArrowLeft className="size-4" />
            Back to feed
          </Link>
        </Button>
      </div>
    )
  }

  const unverified = Boolean(user && !user.email_verified)

  return (
    <>
      <Link
        to={`/communities/${post.community.slug}`}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {post.community.name}
      </Link>

      <PageHeader
        eyebrow={post.type_label}
        title={post.title}
        description={`Shared by ${post.author.full_name} · ${formatRelativeTime(post.created_at)}`}
        actions={
          post.can_edit ? (
            <Button
              variant="ghost"
              size="lg"
              className="h-10 text-destructive hover:bg-destructive/5"
              onClick={handleDeletePost}
              disabled={deletingPost}
            >
              {deletingPost ? <Spinner /> : <Trash2 className="size-4" />}
              Delete
            </Button>
          ) : null
        }
      />

      {actionError && (
        <div className="mb-5">
          <Alert variant="error">{actionError}</Alert>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.65fr_1fr]">
        <div className="space-y-6">
          <article className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={TYPE_VARIANTS[post.type] ?? "default"}>
                {post.type_label}
              </Badge>
              <Link
                to={`/communities/${post.community.slug}`}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-brand-mist hover:text-brand-navy"
              >
                <Pin className="size-3" />
                {post.community.name}
              </Link>
            </div>

            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
              {post.content}
            </p>

            {post.media?.length > 0 && (
              <div className="mt-4 space-y-3">
                {post.media.map((media) => (
                  <ExternalVideoPlayer key={media.id} media={media} />
                ))}
              </div>
            )}

            {post.tags?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline">
                    #{tag.name}
                  </Badge>
                ))}
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <ReactionBar post={post} onReact={handleReact} />
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <MessageCircle className="size-3.5" />
                {post.comment_count}{" "}
                {post.comment_count === 1 ? "comment" : "comments"}
              </span>
            </div>
          </article>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <h2 className="text-base font-semibold text-foreground">Discussion</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {post.comment_count} {post.comment_count === 1 ? "response" : "responses"}
            </p>

            {unverified ? (
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-amber-300/70 bg-amber-50 p-4">
                <MailWarning className="size-4 text-amber-700" />
                <p className="flex-1 text-sm text-amber-900/80">
                  Verify your email to join the discussion. You can still read every response.
                </p>
                <Button asChild size="sm">
                  <Link to="/verify-email">Verify email</Link>
                </Button>
              </div>
            ) : post.can_comment ? (
              <form onSubmit={handleComment} className="mt-4">
                <Textarea
                  rows={3}
                  value={commentBody}
                  onChange={(event) => setCommentBody(event.target.value)}
                  placeholder="Add a thoughtful response…"
                  className="min-h-20"
                />
                <div className="mt-2 flex justify-end">
                  <Button type="submit" size="lg" disabled={submitting || !commentBody.trim()}>
                    {submitting ? <Spinner /> : <Send className="size-4" />}
                    {submitting ? "Posting…" : "Post comment"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-brand-teal/20 bg-brand-mist/50 p-4">
                <Users className="size-4 text-brand-navy" />
                <p className="flex-1 text-sm text-brand-navy/80">
                  Join this community to take part in the discussion.
                </p>
                <Button asChild size="sm">
                  <Link to={`/communities/${post.community.slug}`}>Open community</Link>
                </Button>
              </div>
            )}

            <div className="mt-4 divide-y divide-border">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    canReply={post.can_comment}
                    onReply={handleReply}
                    onDelete={handleDeleteComment}
                    busy={busyCommentId === comment.id}
                  />
                ))
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No responses yet. Be the first to add context, evidence, or a question.
                </p>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <h2 className="text-sm font-semibold text-foreground">Author</h2>
            <div className="mt-3 flex items-center gap-3">
              <Avatar src={post.author.avatar} name={post.author.full_name} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {post.author.full_name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  @{post.author.username}
                </p>
              </div>
            </div>
            <dl className="mt-4 space-y-3 border-t border-border pt-4 text-xs">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Published</dt>
                <dd className="font-medium text-foreground">{formatDate(post.created_at)}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Community</dt>
                <dd className="font-medium text-foreground">{post.community.name}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-medium text-foreground">{post.type_label}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-brand-teal/20 bg-brand-mist/50 p-5">
            <p className="text-sm font-semibold text-brand-navy">Keep it useful</p>
            <p className="mt-2 text-xs leading-relaxed text-brand-navy/70">
              Responses should add context, evidence, or a concrete next step. The goal is to move
              the work forward, not to win the thread.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
