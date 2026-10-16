import Link from "next/link"
import type { ReactNode } from "react"

type StateMessageProps = {
  /** Icono decorativo (SVG o emoji); se oculta a lectores de pantalla */
  icon?: ReactNode
  title: string
  description?: string
  /** Acción principal: botón (onClick) o enlace (href) */
  action?: { label: string; onClick?: () => void; href?: string }
  tone?: "neutral" | "error"
  className?: string
}

/** Estado vacío / de error reutilizable para listados y secciones. */
export default function StateMessage({
  icon,
  title,
  description,
  action,
  tone = "neutral",
  className = "",
}: StateMessageProps) {
  const isError = tone === "error"
  const buttonClass = "btn btn-primary"

  return (
    <div
      role={isError ? "alert" : "status"}
      className={`mx-auto w-full max-w-xl border-2 bg-surface px-6 py-10 text-center ${
        isError ? "border-danger" : "border-line"
      } ${className}`}
    >
      {icon && (
        <div
          aria-hidden="true"
          className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center font-display text-3xl ${
            isError ? "bg-danger/10 text-danger" : "bg-surface-2 text-subtle"
          }`}
        >
          {icon}
        </div>
      )}
      <h3 className="text-3xl text-fg">{title}</h3>
      {description && <p className="mt-2 text-muted">{description}</p>}
      {action && (
        <div className="mt-6">
          {action.href ? (
            <Link href={action.href} className={buttonClass}>
              {action.label}
            </Link>
          ) : (
            <button type="button" onClick={action.onClick} className={buttonClass}>
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
