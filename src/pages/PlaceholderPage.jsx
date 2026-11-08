import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react"
import { Link } from "react-router-dom"

import { PageHeader } from "@/components/layout/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function PlaceholderPage({ eyebrow, title, description, icon: Icon, features }) {
  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={<Badge variant="teal">Next Phase 1 module</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-xs">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-mist text-brand-navy">
            <Icon className="size-6" />
          </span>
          <h2 className="mt-5 text-xl font-semibold text-foreground">
            This module is being built next.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            The foundation—accounts, profiles, and the design system—is working. {title} is the next
            slice of Phase 1, so this page will become functional without changing the rest of the
            architecture.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild size="lg" className="h-10">
              <Link to="/home">
                <ArrowLeft className="size-4" />
                Back to workspace
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-10">
              <Link to="/profile">
                Review your profile
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
            Planned capabilities
          </p>
          <ul className="mt-4 space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-teal" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
