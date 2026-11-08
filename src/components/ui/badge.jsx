import { cn } from "@/lib/utils"

const variants = {
  default: "bg-secondary text-secondary-foreground",
  teal: "bg-brand-mist text-brand-navy",
  navy: "bg-brand-navy text-white",
  outline: "border border-border bg-transparent text-muted-foreground",
  success: "bg-emerald-50 text-emerald-700",
}

export function Badge({ variant = "default", className, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant] ?? variants.default,
        className
      )}
      {...props}
    />
  )
}
