import {
  BookOpen,
  FlaskConical,
  Home,
  Lightbulb,
  LogOut,
  Menu,
  Rss,
  User,
  Users,
  X,
} from "lucide-react"
import { useEffect, useState } from "react"
import { NavLink, Outlet, useLocation } from "react-router-dom"

import { Logo } from "@/components/layout/Logo"
import VerificationBanner from "@/components/layout/VerificationBanner"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/features/auth/AuthContext"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { to: "/home", label: "Home", icon: Home, end: true },
  { to: "/feed", label: "Feed", icon: Rss },
  { to: "/communities", label: "Communities", icon: Users },
  { to: "/problems", label: "Problems & Ideas", icon: Lightbulb },
  { to: "/research", label: "Research & Projects", icon: FlaskConical },
  { to: "/knowledge", label: "My Knowledge", icon: BookOpen },
  { to: "/profile", label: "My Profile", icon: User },
]

function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth()

  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pb-6 pt-7">
        <Logo />
      </div>

      <div className="px-4">
        <div className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
            Workspace
          </p>
          <p className="mt-1 text-sm font-medium text-white/90">Scientific Innovation</p>
          <p className="mt-0.5 text-xs text-white/50">Phase 1 · Foundation</p>
        </div>
      </div>

      <nav className="mt-6 flex-1 space-y-1 overflow-y-auto px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-teal/15 text-white"
                  : "text-white/65 hover:bg-white/5 hover:text-white"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn(
                    "size-4.5 transition-colors",
                    isActive ? "text-brand-teal" : "text-white/45 group-hover:text-white/80"
                  )}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <Avatar src={user?.avatar} name={user?.full_name || user?.username} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {user?.full_name || user?.username}
            </p>
            <p className="truncate text-xs text-white/45">@{user?.username}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-md p-1.5 text-white/45 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 bg-brand-navy shadow-2xl shadow-brand-navy/20 lg:block">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-brand-navy/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-brand-navy shadow-2xl lg:hidden">
            <div className="absolute right-3 top-4">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                aria-label="Close menu"
              >
                <X className="size-4" />
              </button>
            </div>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-border/80 bg-background/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-lg border border-border bg-card p-2 text-muted-foreground shadow-xs transition-colors hover:text-foreground lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="size-4" />
              </button>
              <div className="hidden items-center gap-2 sm:flex">
                <span className="text-sm font-medium text-muted-foreground">Discovery workspace</span>
                <Badge variant="teal">Prototype</Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-xs sm:flex">
                <span className="size-1.5 rounded-full bg-brand-teal" />
                API connected
              </div>
              <NavLink to="/profile" className="flex items-center gap-2 rounded-full p-0.5">
                <Avatar
                  src={user?.avatar}
                  name={user?.full_name || user?.username}
                  size="sm"
                  className="ring-2 ring-border"
                />
              </NavLink>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <VerificationBanner />
          <Outlet />
        </main>
      </div>
    </div>
  )
}
