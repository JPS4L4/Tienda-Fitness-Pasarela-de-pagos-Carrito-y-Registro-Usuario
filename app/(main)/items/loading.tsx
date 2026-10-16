import { ItemCardSkeleton } from "@/components/skeletons/ItemCardSkeleton"

export default function ItemsLoading() {
  return (
    <div className="bg-gray-100 min-h-screen pb-12" role="status" aria-label="Cargando productos">
      <div className="container mx-auto px-4 pt-6">
        <div className="mb-6 h-5 w-48 animate-pulse rounded bg-gray-200" />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ItemCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
