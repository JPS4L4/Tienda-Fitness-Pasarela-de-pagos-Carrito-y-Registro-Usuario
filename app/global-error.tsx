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
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f8fafc", color: "#0f172a" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "1.5rem", textAlign: "center" }}>
          <div>
            <h1 style={{ fontSize: "2rem", margin: 0 }}>Algo salió mal</h1>
            <p style={{ color: "#475569", marginTop: "0.75rem" }}>Ha ocurrido un error inesperado. Intenta de nuevo.</p>
            <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                onClick={reset}
                style={{ background: "#4f46e5", color: "#fff", border: 0, borderRadius: 8, padding: "0.6rem 1.2rem", fontWeight: 600, cursor: "pointer" }}
              >
                Intentar de nuevo
              </button>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/" style={{ background: "#e2e8f0", color: "#0f172a", borderRadius: 8, padding: "0.6rem 1.2rem", fontWeight: 600, textDecoration: "none" }}>
                Ir al inicio
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
