"use client"

export const PlanCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col justify-between h-full animate-pulse relative overflow-hidden">
      
      {/* Decoración fondo */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-100 rounded-full opacity-50" />

      <div>
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 bg-slate-200 rounded-xl" />
          <div className="h-5 w-20 bg-slate-200 rounded-full" />
        </div>

        {/* Título */}
        <div className="h-7 w-3/4 bg-slate-200 rounded mb-3" />

        {/* Precio */}
        <div className="flex items-baseline gap-2 mb-6">
          <div className="h-8 w-24 bg-slate-200 rounded" />
          <div className="h-4 w-14 bg-slate-200 rounded" />
        </div>

        {/* Beneficios */}
        <ul className="space-y-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 bg-slate-200 rounded-full" />
              <div className="h-4 w-full bg-slate-200 rounded" />
            </li>
          ))}
        </ul>
      </div>

      {/* Botones */}
      <div className="flex items-center gap-3 mt-6">
        <div className="flex-1 h-12 bg-slate-200 rounded-xl" />
        <div className="w-12 h-12 bg-slate-200 rounded-full" />
      </div>
    </div>
  )
}
