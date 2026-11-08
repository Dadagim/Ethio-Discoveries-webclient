import { ArrowLeft, Compass } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-mist text-brand-navy">
          <Compass className="size-7" />
        </span>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
          404
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          This page is not part of the map yet.
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The address may be wrong, or the page may belong to a later phase of the ecosystem.
        </p>
        <Button asChild size="lg" className="mt-6 h-10">
          <Link to="/home">
            <ArrowLeft className="size-4" />
            Return to workspace
          </Link>
        </Button>
      </div>
    </div>
  )
}
