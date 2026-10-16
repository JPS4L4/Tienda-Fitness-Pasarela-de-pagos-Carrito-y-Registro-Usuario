import { ItemCardSkeleton } from "@/components/skeletons/ItemCardSkeleton"

export default function ItemsLoading() {
  return (
    <div className="bg-bg min-h-screen pb-12" role="status" aria-label="Cargando productos">
      <div className="container mx-auto px-4 pt-6">
        <div className="mb-6 h-5 w-48 animate-pulse  bg-surface-3" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ItemCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
