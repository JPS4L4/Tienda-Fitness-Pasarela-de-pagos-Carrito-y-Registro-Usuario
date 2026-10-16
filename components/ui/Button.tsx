import Link from "next/link"
import { cn } from "@/lib/utils"

type Variant = "primary" | "secondary" | "ghost" | "danger" | "ok"
type Size = "sm" | "md" | "lg"

const VARIANT: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
  ok: "btn-ok",
}

const SIZE: Record<Size, string> = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
}

type CommonProps = {
  variant?: Variant
  size?: Size
  block?: boolean
  className?: string
  children: React.ReactNode
}

type ButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { href?: undefined }

type LinkProps = CommonProps &
  Omit<React.ComponentProps<typeof Link>, keyof CommonProps> & { href: string }

/** Botón único del sistema: usa las clases .btn de globals.css (radio 0, sombra dura). */
export function Button(props: ButtonProps | LinkProps) {
  const { variant = "primary", size = "md", block, className, children, ...rest } = props
  const classes = cn("btn", VARIANT[variant], SIZE[size], block && "btn-block", className)

  if ("href" in rest && rest.href !== undefined) {
    return (
      <Link className={classes} {...(rest as Omit<LinkProps, keyof CommonProps>)}>
        {children}
      </Link>
    )
  }
  return (
    <button type="button" className={classes} {...(rest as Omit<ButtonProps, keyof CommonProps>)}>
      {children}
    </button>
  )
}
