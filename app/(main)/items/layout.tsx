import type { Metadata } from "next"
import type { ReactNode } from "react"
import { BRAND_NAME } from "@/lib/brand"

// Un title en string aquí haría perder el template del layout raíz en /items/[slug].
export const metadata: Metadata = {
  title: {
    default: "Tienda",
    template: `%s | ${BRAND_NAME}`,
  },
  description: "Equipamiento, suplementos, ropa y accesorios para tu entrenamiento, con filtros por categoría, precio y descuento.",
}

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
