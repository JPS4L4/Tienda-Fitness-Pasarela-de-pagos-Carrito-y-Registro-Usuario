import { PlanCardSkeleton } from "@/components/skeletons/PlanCardSkeleton"

export default function PlansLoading() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16" role="status" aria-label="Cargando planes">
      <div className="mx-auto mb-12 max-w-4xl text-center">
        <div className="mx-auto mb-4 h-10 w-64 animate-pulse rounded bg-slate-200" />
        <div className="mx-auto h-4 w-96 max-w-full animate-pulse rounded bg-slate-200" />
      </div>
      <div className="mx-auto grid max-w-7xl grid-cols-1 justify-items-center gap-8 px-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <PlanCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
