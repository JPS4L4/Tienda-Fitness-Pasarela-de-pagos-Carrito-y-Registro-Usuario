"use client"

import { useEffect } from "react"
import StateMessage from "@/components/others/StateMessage"

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Solo el digest llega al registro; el detalle del error no se muestra al usuario
    console.error("Route error", error.digest ?? "")
  }, [error])

  return (
    <main className="flex min-h-[60vh] items-center bg-slate-50 px-4 py-16">
      <StateMessage
        tone="error"
        icon="!"
        title="Algo salió mal"
        description="No pudimos cargar esta página. Intenta de nuevo en unos segundos."
        action={{ label: "Reintentar", onClick: reset }}
      />
    </main>
  )
}
