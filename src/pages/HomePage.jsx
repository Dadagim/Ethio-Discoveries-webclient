import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  FlaskConical,
  Lightbulb,
  Sparkles,
  Target,
  UserRound,
  Users,
} from "lucide-react"
import { Link } from "react-router-dom"

import { PageHeader } from "@/components/layout/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/AuthContext"

const MODULES = [
  {
    icon: Users,
    title: "Discover communities",
    text: "Find people working in your discipline or on the problem that keeps you curious.",
    to: "/communities",
    action: "Explore communities",
    status: "Ready",
  },
  {
    icon: Lightbulb,
    title: "Publish a problem",
    text: "Turn a real-world challenge into a shared investigation with a clear outcome.",
    to: "/problems",
    action: "Open problems",
    status: "Scheduled",
  },
  {
    icon: BookOpen,
    title: "Document knowledge",
    text: "Keep private folders and original learning entries that you can return to.",
    to: "/knowledge",
    action: "Open My Knowledge",
    status: "Scheduled",
  },
  {
    icon: FlaskConical,
    title: "Share research",
    text: "Publish experiments, observations, and projects the community can examine.",
    to: "/research",
    action: "Open research",
    status: "Scheduled",
  },
]

const FOUNDATION = [
  { label: "Accounts and profiles", done: true },
  { label: "Secure session authentication", done: true },
  { label: "Navy and teal design system", done: true },
  { label: "Scientific communities", done: true },
  { label: "Contributions and discussions", done: false },
  { label: "Private knowledge space", done: false },
]

export default function HomePage() {
  const { user } = useAuth()
  const firstName = user?.first_name || user?.username || "researcher"

  const profileSignals = [
    user?.first_name,
    user?.last_name,
    user?.bio,
    user?.institution,
    user?.location,
    user?.interest_names?.length,
    user?.skill_names?.length,
  ]
  const completedSignals = profileSignals.filter(Boolean).length
  const profilePercent = Math.round((completedSignals / profileSignals.length) * 100)

  return (
    <>
      <PageHeader
        eyebrow="Your workspace"
        title={`Welcome back, ${firstName}.`}
        description="This is the starting point for your scientific work: the communities you join, the problems you investigate, and the knowledge you keep."
        actions={
          <Button asChild size="lg" className="h-10 px-4">
            <Link to="/communities">
              Explore communities
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {MODULES.map(({ icon: Icon, title, text, to, action, status }) => (
              <div
                key={title}
                className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-brand-mist text-brand-navy">
                    <Icon className="size-5" />
                  </span>
                  <Badge variant={status === "Ready" ? "teal" : "outline"}>{status}</Badge>
                </div>
                <h2 className="mt-4 text-base font-semibold text-foreground">{title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
                <Link
                  to={to}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-navy transition-colors hover:text-brand-teal"
                >
                  {action}
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
                  How it connects
                </p>
                <h2 className="mt-1.5 text-lg font-semibold text-foreground">
                  One thread from learning to innovation
                </h2>
              </div>
              <span className="hidden size-10 items-center justify-center rounded-xl bg-brand-mist text-brand-navy sm:flex">
                <Sparkles className="size-5" />
              </span>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { step: "01", title: "Learn & document", text: "Capture an idea in My Knowledge." },
                { step: "02", title: "Discuss & investigate", text: "Bring it to a community as a question or problem." },
                { step: "03", title: "Experiment & build", text: "Collaborate on evidence, then publish a solution." },
              ].map(({ step, title, text }) => (
                <div key={step} className="rounded-xl bg-secondary/70 p-4">
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-brand-teal">{step}</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Target className="size-3.5 text-brand-teal" />
              Every contribution should move the work forward, not just the feed.
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Your profile</p>
              <Link
                to="/profile"
                className="text-xs font-medium text-brand-navy hover:text-brand-teal"
              >
                Open profile
              </Link>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-brand-navy text-sm font-semibold text-white">
                {(user?.full_name || user?.username || "?")
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {user?.full_name || user?.username}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.institution || "Add your institution"}
                </p>
              </div>
            </div>
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Profile completeness</span>
                <span className="font-medium text-foreground">{profilePercent}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-brand-teal transition-all"
                  style={{ width: `${profilePercent}%` }}
                />
              </div>
            </div>
            <Button asChild variant="outline" size="lg" className="mt-5 h-9 w-full">
              <Link to="/profile">
                <UserRound className="size-4" />
                Complete your profile
              </Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Phase 1 foundation</p>
              <Badge variant="navy">Build status</Badge>
            </div>
            <ul className="mt-4 space-y-3">
              {FOUNDATION.map(({ label, done }) => (
                <li key={label} className="flex items-center gap-2.5 text-sm">
                  {done ? (
                    <CheckCircle2 className="size-4 shrink-0 text-brand-teal" />
                  ) : (
                    <Circle className="size-4 shrink-0 text-border" />
                  )}
                  <span className={done ? "text-foreground" : "text-muted-foreground"}>{label}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
              This status reflects what is actually implemented and tested—not the full long-term
              vision.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
