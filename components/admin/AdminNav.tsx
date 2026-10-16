"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/items", label: "Items" },
  { href: "/admin/orders", label: "Órdenes" },
  { href: "/admin/plans", label: "Planes" },
  { href: "/admin/users", label: "Usuarios" },
  { href: "/admin/sales", label: "Ventas" },
]

export default function AdminNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Administración" className="scrollbar-hide -mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:px-0">
      {LINKS.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href)
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 border-b-4 px-3 py-3 text-sm font-extrabold uppercase tracking-[0.1em] transition-colors",
              active ? "border-accent text-fg" : "border-transparent text-muted hover:text-fg"
            )}
          >
            {l.label}
          </Link>
        )
      })}
    </nav>
  )
}
