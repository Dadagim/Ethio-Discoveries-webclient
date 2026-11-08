import { Atom } from "lucide-react"
import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"

export function Logo({ compact = false, tone = "dark", className }) {
  const onDark = tone === "dark"

  return (
    <Link to="/home" className={cn("inline-flex items-center gap-3", className)}>
      <span className="flex size-10 items-center justify-center rounded-xl bg-brand-teal text-brand-navy shadow-lg shadow-black/10">
        <Atom className="size-5" strokeWidth={2.2} />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span
            className={cn(
              "block text-lg font-semibold tracking-tight",
              onDark ? "text-white" : "text-brand-navy"
            )}
          >
            ETPM
          </span>
          <span
            className={cn(
              "block text-[11px] font-medium uppercase tracking-[0.18em]",
              onDark ? "text-white/55" : "text-muted-foreground"
            )}
          >
            Knowledge Ecosystem
          </span>
        </span>
      )}
    </Link>
  )
}
