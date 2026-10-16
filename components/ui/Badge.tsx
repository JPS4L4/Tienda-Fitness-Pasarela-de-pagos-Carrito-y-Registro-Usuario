import { cn } from "@/lib/utils"

type Tone = "neutral" | "accent" | "ok" | "warn" | "danger" | "outline"

const TONE: Record<Tone, string> = {
  neutral: "",
  accent: "badge-accent",
  ok: "badge-ok",
  warn: "badge-warn",
  danger: "badge-danger",
  outline: "badge-outline",
}

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone
  className?: string
  children: React.ReactNode
}) {
  return <span className={cn("badge", TONE[tone], className)}>{children}</span>
}
