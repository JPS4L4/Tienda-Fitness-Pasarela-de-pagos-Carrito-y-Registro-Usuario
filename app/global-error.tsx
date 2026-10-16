"use client";

import { useEffect } from "react";

// Se renderiza solo si falla el layout raíz: debe incluir <html> y <body> propios.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error", error.digest ?? "");
  }, [error]);

  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#0a0a0b", color: "#f5f3ef" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "1.5rem", textAlign: "center" }}>
          <div>
            <h1 style={{ fontSize: "2rem", margin: 0 }}>Algo salió mal</h1>
            <p style={{ color: "#a9a9b1", marginTop: "0.75rem" }}>Ha ocurrido un error inesperado. Intenta de nuevo.</p>
            <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                onClick={reset}
                style={{ background: "#ff4d14", color: "#0a0a0b", border: 0, borderRadius: 0, padding: "0.75rem 1.5rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}
              >
                Intentar de nuevo
              </button>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/" style={{ border: "2px solid #f5f3ef", color: "#f5f3ef", borderRadius: 0, padding: "0.7rem 1.5rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", textDecoration: "none" }}>
                Ir al inicio
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
