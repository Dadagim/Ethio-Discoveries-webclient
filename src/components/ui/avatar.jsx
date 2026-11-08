import { cn } from "@/lib/utils"

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

const sizes = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-xl",
  xl: "size-24 text-3xl",
}

export function Avatar({ src, name, size = "md", className }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-navy font-semibold text-white ring-2 ring-white/20",
        sizes[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={name || "User avatar"} className="size-full object-cover" />
      ) : (
        <span>{getInitials(name) || "?"}</span>
      )}
    </div>
  )
}
