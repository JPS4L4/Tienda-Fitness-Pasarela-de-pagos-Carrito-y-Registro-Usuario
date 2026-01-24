"use client"

export const ItemCardSkeleton = () => {
  return (
    <div className="flex flex-col bg-white rounded-xl border border-gray-200 w-full max-w-[350px] overflow-hidden animate-pulse">
      
      {/* Imagen */}
      <div className="relative aspect-square bg-gray-200" />

      {/* Contenido */}
      <div className="p-4 flex flex-col gap-3">
        {/* Precio */}
        <div className="h-7 w-32 bg-gray-200 rounded" />

        {/* Precio tachado */}
        <div className="h-4 w-24 bg-gray-200 rounded" />

        {/* Cuotas */}
        <div className="h-4 w-40 bg-gray-200 rounded" />

        {/* Título */}
        <div className="h-5 w-full bg-gray-200 rounded" />
        <div className="h-5 w-3/4 bg-gray-200 rounded" />

        {/* Categoría */}
        <div className="h-4 w-24 bg-gray-200 rounded mt-1" />
      </div>
    </div>
  )
}
