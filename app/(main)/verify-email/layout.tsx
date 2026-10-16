import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Verificar correo",
  description: "Confirma tu correo electrónico para activar tu cuenta.",
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
