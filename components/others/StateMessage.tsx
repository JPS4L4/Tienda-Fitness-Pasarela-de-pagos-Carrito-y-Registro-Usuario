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
  const buttonClass =
    "inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"

  return (
    <div
      role={isError ? "alert" : "status"}
      className={`mx-auto w-full max-w-xl rounded-2xl border bg-white px-6 py-10 text-center shadow-sm ${
        isError ? "border-red-200" : "border-slate-200"
      } ${className}`}
    >
      {icon && (
        <div
          aria-hidden="true"
          className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl ${
            isError ? "bg-red-50 text-red-500" : "bg-slate-100 text-slate-400"
          }`}
        >
          {icon}
        </div>
      )}
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      {description && <p className="mt-2 text-slate-600">{description}</p>}
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
