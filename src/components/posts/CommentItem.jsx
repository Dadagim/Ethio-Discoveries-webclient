import { CornerDownRight, Send, Trash2 } from "lucide-react"
import { useState } from "react"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatRelativeTime } from "@/lib/format"

export default function CommentItem({
  comment,
  depth = 0,
  canReply = false,
  onReply,
  onDelete,
  busy = false,
}) {
  const [replyOpen, setReplyOpen] = useState(false)
  const [body, setBody] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleReply = async (event) => {
    event.preventDefault()
    if (!body.trim()) return
    setSubmitting(true)
    const ok = await onReply(comment.id, body.trim())
    if (ok) {
      setBody("")
      setReplyOpen(false)
    }
    setSubmitting(false)
  }

  return (
    <div className={depth > 0 ? "ml-5 border-l border-border pl-4 sm:ml-8" : ""}>
      <div className="flex items-start gap-3 py-3">
        <Avatar src={comment.author.avatar} name={comment.author.full_name} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{comment.author.full_name}</span>
            <span>@{comment.author.username}</span>
            <span aria-hidden="true">·</span>
            <span>{formatRelativeTime(comment.created_at)}</span>
          </div>
          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
            {comment.body}
          </p>

          <div className="mt-2 flex items-center gap-3">
            {canReply && depth === 0 && (
              <button
                type="button"
                onClick={() => setReplyOpen((current) => !current)}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <CornerDownRight className="size-3" />
                Reply
              </button>
            )}
            {comment.can_delete && (
              <button
                type="button"
                onClick={() => onDelete(comment.id)}
                disabled={busy}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
              >
                <Trash2 className="size-3" />
                Delete
              </button>
            )}
          </div>

          {replyOpen && (
            <form onSubmit={handleReply} className="mt-3 space-y-2">
              <Textarea
                rows={2}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder={`Reply to ${comment.author.full_name}`}
                className="min-h-16 text-sm"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <Button type="submit" size="sm" disabled={submitting || !body.trim()}>
                  <Send className="size-3.5" />
                  {submitting ? "Sending…" : "Send reply"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          depth={depth + 1}
          canReply={false}
          onReply={onReply}
          onDelete={onDelete}
          busy={busy}
        />
      ))}
    </div>
  )
}
