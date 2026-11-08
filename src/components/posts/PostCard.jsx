import { MessageCircle, Pin, Play } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

import ReactionBar from "@/components/posts/ReactionBar"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatRelativeTime } from "@/lib/format"

const TYPE_VARIANTS = {
  discussion: "default",
  question: "teal",
  problem: "navy",
  idea: "success",
  research: "navy",
  project: "teal",
}

export default function PostCard({ post, showCommunity = true, onReact }) {
  const [reaction, setReaction] = useState(null)
  const viewPost = reaction
    ? {
        ...post,
        reaction_summary: reaction.reaction_summary,
        my_reaction: reaction.my_reaction,
      }
    : post

  const handleReact = (result) => {
    setReaction(result)
    onReact?.(post.id, result)
  }

  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-md sm:p-6">
      <div className="flex items-start gap-3">
        <Avatar
          src={post.author.avatar}
          name={post.author.full_name}
          size="sm"
          className="mt-0.5"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{post.author.full_name}</span>
            <span>@{post.author.username}</span>
            {showCommunity && (
              <>
                <span aria-hidden="true">·</span>
                <Link
                  to={`/communities/${post.community.slug}`}
                  className="inline-flex items-center gap-1 font-medium text-brand-navy hover:text-brand-teal"
                >
                  <Pin className="size-3" />
                  {post.community.name}
                </Link>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>{formatRelativeTime(post.created_at)}</span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant={TYPE_VARIANTS[post.type] ?? "default"}>
              {post.type_label}
            </Badge>
          </div>

          <h2 className="mt-2.5 text-lg font-semibold leading-snug tracking-tight text-foreground">
            <Link
              to={`/posts/${post.id}`}
              className="transition-colors hover:text-brand-navy"
            >
              {post.title}
            </Link>
          </h2>
          <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {post.content}
          </p>

          {post.media?.length > 0 && (
            <Link
              to={`/posts/${post.id}`}
              className="mt-3 flex items-center gap-3 overflow-hidden rounded-xl border border-border bg-secondary/30 transition-colors hover:bg-secondary/50"
            >
              {post.media[0].thumbnail_url ? (
                <img
                  src={post.media[0].thumbnail_url}
                  alt=""
                  loading="lazy"
                  className="h-16 w-28 shrink-0 object-cover"
                />
              ) : (
                <span className="flex h-16 w-28 shrink-0 items-center justify-center bg-brand-navy text-white">
                  <Play className="size-5 fill-current" />
                </span>
              )}
              <span className="min-w-0 flex-1 pr-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-navy">
                  <Play className="size-3.5 fill-current" aria-hidden="true" />
                  Video
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {post.media[0].title || "Attached video"}
                </span>
              </span>
            </Link>
          )}

          {post.tags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <Badge key={tag.id} variant="outline">
                  #{tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <ReactionBar post={viewPost} onReact={handleReact} />
        <Link
          to={`/posts/${post.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <MessageCircle className="size-3.5" />
          {post.comment_count} {post.comment_count === 1 ? "comment" : "comments"}
        </Link>
      </div>
    </article>
  )
}
