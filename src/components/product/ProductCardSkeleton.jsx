// Mirrors the shape of ProductCard so the grid does not jump when data lands.
export default function ProductCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden" aria-hidden="true">
      <div className="aspect-square skeleton rounded-none" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-2/3" />
        <div className="flex items-center justify-between pt-1">
          <div className="skeleton h-6 w-24" />
          <div className="skeleton h-10 w-10 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
