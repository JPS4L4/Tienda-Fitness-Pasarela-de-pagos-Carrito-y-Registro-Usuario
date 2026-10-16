export default function Loading() {
  return (
    <main
      className="flex min-h-[60vh] items-center justify-center bg-bg"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="spinner" />
        <p className="text-sm font-medium text-muted">Cargando...</p>
      </div>
    </main>
  )
}
