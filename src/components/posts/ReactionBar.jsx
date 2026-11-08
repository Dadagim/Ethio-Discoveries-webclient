import { Heart, Lightbulb, ThumbsUp } from "lucide-react"
import { useState } from "react"

import { reactToPost } from "@/api/posts"
import { useAuth } from "@/features/auth/AuthContext"
import { cn } from "@/lib/utils"

const OPTIONS = [
  { type: "like", label: "Like", icon: ThumbsUp },
  { type: "insightful", label: "Insightful", icon: Lightbulb },
  { type: "helpful", label: "Helpful", icon: Heart },
]

export default function ReactionBar({ post, onReact, compact = false }) {
  const { user } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const summary = post.reaction_summary ?? {}
  const unverified = Boolean(user && !user.email_verified)

  const handleReact = async (type) => {
    if (busy || unverified) return
    setBusy(true)
    setError("")
    try {
      const result = await reactToPost(post.id, type)
      onReact?.(result)
    } catch {
      setError("Reaction failed.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {OPTIONS.map(({ type, label, icon: Icon }) => {
        const active = post.my_reaction === type
        const count = summary[type] ?? 0
        return (
          <button
            key={type}
            type="button"
            onClick={() => handleReact(type)}
            disabled={busy || unverified}
            title={unverified ? "Verify your email to react" : undefined}
            aria-pressed={active}
            aria-label={`${label}${count ? `, ${count}` : ""}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-60",
              active
                ? "border-brand-teal/40 bg-brand-mist text-brand-navy"
                : "border-border bg-background text-muted-foreground hover:border-brand-teal/30 hover:text-foreground"
            )}
          >
            <Icon className={cn("size-3.5", active && "text-brand-teal")} />
            {!compact && <span>{label}</span>}
            {count > 0 && <span className="tabular-nums">{count}</span>}
          </button>
        )
      })}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  )
}
