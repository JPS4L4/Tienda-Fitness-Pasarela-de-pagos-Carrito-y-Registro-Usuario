import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbenos para resolver dudas sobre productos, planes o tu entrenamiento personalizado.",
}

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
