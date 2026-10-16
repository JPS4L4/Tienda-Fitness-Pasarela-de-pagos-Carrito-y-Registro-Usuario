"use client"

export const PlanCardSkeleton = () => {
  return (
    <div className="flex h-full w-full animate-pulse flex-col overflow-hidden border border-line bg-surface">
      <div className="aspect-[16/10] bg-surface-3" />
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="h-6 w-3/4 bg-surface-3" />
        <div className="h-10 w-40 bg-surface-3" />
        <ul className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="h-5 w-5 bg-surface-3" />
              <div className="h-4 w-full bg-surface-3" />
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-center gap-3 pt-4">
          <div className="h-12 flex-1 bg-surface-3" />
          <div className="h-12 w-12 bg-surface-3" />
        </div>
      </div>
    </div>
  )
}
