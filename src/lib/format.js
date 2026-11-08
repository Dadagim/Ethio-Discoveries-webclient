export function formatDate(value, options = {}) {
  if (!value) return "—"

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(new Date(value))
}

export function formatMonthYear(value) {
  if (!value) return "—"
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(
    new Date(value)
  )
}

export function splitTags(value) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export function formatRelativeTime(value) {
  if (!value) return ""

  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000)
  if (seconds < 60) return "just now"

  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`

  return formatDate(value)
}
