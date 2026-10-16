import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Soporte",
  description: "Centro de ayuda: envíanos tu consulta sobre pedidos, pagos o acceso a tus planes.",
}

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
