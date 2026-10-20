import type { Metadata } from "next"
import type { ReactNode } from "react"
import TestModeBanner from "@/components/others/TestModeBanner"
import { PaymentModeProvider } from "@/context/PaymentModeContext"
import { getPaymentMode } from "@/lib/payments/mode"

// PAYMENT_MODE se lee en cada petición: cambiarlo no exige volver a construir la app.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Checkout",
  description: "Finaliza tu compra de forma segura.",
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: ReactNode }) {
  const mode = getPaymentMode()
  return (
    <PaymentModeProvider mode={mode}>
      <TestModeBanner mode={mode} />
      {children}
    </PaymentModeProvider>
  )
}
