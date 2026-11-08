import { AlertCircle, CheckCircle2, Info } from "lucide-react"

import { cn } from "@/lib/utils"

const variants = {
  error: {
    container: "border-destructive/25 bg-destructive/5 text-destructive",
    Icon: AlertCircle,
  },
  success: {
    container: "border-emerald-600/20 bg-emerald-50 text-emerald-800",
    Icon: CheckCircle2,
  },
  info: {
    container: "border-brand-teal/25 bg-brand-mist text-brand-navy",
    Icon: Info,
  },
}

export function Alert({ variant = "info", className, children, ...props }) {
  const { container, Icon } = variants[variant] ?? variants.info

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm leading-relaxed",
        container,
        className
      )}
      {...props}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  )
}
