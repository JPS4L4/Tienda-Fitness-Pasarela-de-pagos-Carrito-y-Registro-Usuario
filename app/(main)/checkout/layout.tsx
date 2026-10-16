import type { Metadata } from "next"
import type { ReactNode } from "react"
import TestModeBanner from "@/components/others/TestModeBanner"

export const metadata: Metadata = {
  title: "Checkout",
  description: "Finaliza tu compra de forma segura con tarjeta o Mercado Pago.",
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <TestModeBanner />
      {children}
    </>
  )
}
