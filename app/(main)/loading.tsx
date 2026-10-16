export default function Loading() {
  return (
    <main
      className="flex min-h-[60vh] items-center justify-center bg-white"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
        <p className="text-sm font-medium text-slate-500">Cargando...</p>
      </div>
    </main>
  )
}
