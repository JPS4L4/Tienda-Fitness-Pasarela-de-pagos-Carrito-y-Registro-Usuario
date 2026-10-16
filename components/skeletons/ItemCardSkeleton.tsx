"use client"

export const ItemCardSkeleton = () => {
  return (
    <div className="flex w-full animate-pulse flex-col overflow-hidden border border-line bg-surface">
      <div className="aspect-square bg-surface-3" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-3 w-20 bg-surface-3" />
        <div className="h-4 w-full bg-surface-3" />
        <div className="h-4 w-3/4 bg-surface-3" />
        <div className="mt-2 h-8 w-32 bg-surface-3" />
        <div className="h-3 w-28 bg-surface-3" />
      </div>
      <div className="px-4 pb-4">
        <div className="h-12 w-full bg-surface-3" />
      </div>
    </div>
  )
}
