import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede o crea tu cuenta para comprar y gestionar tus planes.",
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
