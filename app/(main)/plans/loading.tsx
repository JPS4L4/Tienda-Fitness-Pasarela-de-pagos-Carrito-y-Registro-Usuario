import { PlanCardSkeleton } from "@/components/skeletons/PlanCardSkeleton"

export default function PlansLoading() {
  return (
    <div className="min-h-screen bg-bg px-4 py-16" role="status" aria-label="Cargando planes">
      <div className="container mx-auto mb-12">
        <div className="mb-4 h-12 w-72 animate-pulse bg-surface-3" />
        <div className="h-4 w-96 max-w-full animate-pulse bg-surface-3" />
      </div>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <PlanCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
