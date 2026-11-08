import {
  ArrowRight,
  BookOpen,
  FlaskConical,
  GraduationCap,
  Lightbulb,
  MessagesSquare,
  Sparkles,
  Target,
  Users,
} from "lucide-react"
import { Link, Navigate } from "react-router-dom"

import { Logo } from "@/components/layout/Logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/features/auth/AuthContext"

const JOURNEY = [
  { icon: GraduationCap, label: "Learn", text: "Study a topic and record what you understood." },
  { icon: BookOpen, label: "Document", text: "Organise your learning in a private knowledge space." },
  { icon: MessagesSquare, label: "Discuss", text: "Exchange ideas with people who share the question." },
  { icon: Target, label: "Investigate", text: "Turn a real problem into a focused investigation." },
  { icon: FlaskConical, label: "Experiment", text: "Test, measure, and publish what you observed." },
  { icon: Sparkles, label: "Innovate", text: "Build a practical solution with collaborators." },
]

const PILLARS = [
  {
    icon: Users,
    title: "Scientific communities",
    text: "Discipline-based, problem-oriented, and institution-based groups in one shared structure.",
  },
  {
    icon: Lightbulb,
    title: "Problems into projects",
    text: "Publish real-world challenges and connect them to people, experiments, and solutions.",
  },
  {
    icon: BookOpen,
    title: "Personal knowledge",
    text: "A private space for original notes, folders, and learning entries that you control.",
  },
  {
    icon: FlaskConical,
    title: "Research and experiments",
    text: "Document methods, observations, and results in a form the community can examine.",
  },
]

export default function LandingPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="size-6 text-brand-teal" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/home" replace />
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo tone="light" />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="lg" className="hidden sm:inline-flex">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild size="lg" className="h-10 px-4">
              <Link to="/register">
                Join the ecosystem
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-40 -top-48 size-[34rem] rounded-full bg-brand-teal/10 blur-3xl" />
            <div className="absolute -left-40 top-24 size-[26rem] rounded-full bg-brand-navy/5 blur-3xl" />
          </div>

          <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-24">
            <div>
              <Badge variant="teal" className="mb-5 px-3 py-1">
                Phase 1 prototype · Scientific Innovation & Knowledge Ecosystem
              </Badge>
              <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-brand-navy sm:text-5xl lg:text-6xl">
                Where learning becomes <span className="text-brand-teal">innovation.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                ETPM connects the knowledge you document, the communities you join, the problems
                you investigate, and the solutions you build. One ecosystem, from first lesson to
                working prototype.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 px-6 text-[0.95rem]">
                  <Link to="/register">
                    Create your workspace
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 border-border bg-card px-6 text-[0.95rem]"
                >
                  <Link to="/login">I already have an account</Link>
                </Button>
              </div>
              <p className="mt-5 text-sm text-muted-foreground">
                Built for students, researchers, engineers, professionals, and independent learners.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-brand-teal/10 blur-2xl" />
              <div className="relative rounded-2xl border border-border bg-card p-6 shadow-xl shadow-brand-navy/5 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
                      The journey
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-brand-navy">
                      A problem becomes a project
                    </h2>
                  </div>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-mist text-brand-navy">
                    <Lightbulb className="size-5" />
                  </span>
                </div>
                <div className="mt-6 space-y-4">
                  {JOURNEY.map(({ icon: Icon, label, text }, index) => (
                    <div key={label} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-brand-teal/25 bg-brand-mist text-brand-navy">
                          <Icon className="size-3.5" />
                        </span>
                        {index < JOURNEY.length - 1 && (
                          <span className="my-1 h-full w-px bg-border" />
                        )}
                      </div>
                      <div className="pb-1">
                        <p className="text-sm font-medium text-foreground">{label}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                          {text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-xl border border-brand-teal/20 bg-brand-mist/60 p-4">
                  <p className="text-xs font-medium text-brand-navy">
                    “How can we develop an affordable system to monitor agricultural soil
                    moisture?”
                  </p>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    A real problem. A community. A place to begin.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border/70 bg-card/60">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
                Four connected pillars
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-brand-navy">
                Not another feed. A place to do the work.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Knowledge management, scientific communities, problem-solving, and research
                publishing share one architecture—so a note can become a question, and a question
                can become a project.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PILLARS.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-md"
                >
                  <span className="flex size-10 items-center justify-center rounded-lg bg-brand-mist text-brand-navy">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 rounded-2xl bg-brand-navy p-8 text-white sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
                Built in the open
              </p>
              <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
                A foundation you can inspect, test, and grow.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
                Phase 1 is deliberately focused: accounts, profiles, communities, contributions,
                discussions, and a private knowledge space. AI comes later—after the human
                foundation is stable.
              </p>
            </div>
            <Button asChild size="lg" className="h-11 bg-brand-teal px-5 text-brand-navy hover:bg-brand-teal/90">
              <Link to="/register">
                Start the journey
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>ETPM · Scientific Innovation & Knowledge Ecosystem</p>
          <p>Phase 1 prototype · Learning → Documenting → Discussing → Innovating</p>
        </div>
      </footer>
    </div>
  )
}
