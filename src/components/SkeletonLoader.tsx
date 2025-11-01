interface SkeletonProps {
  className?: string
}

export function SkeletonLine({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-neutral-200 rounded h-4 ${className}`} />
  )
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-white rounded-xl shadow-soft p-6 ${className}`}>
      <div className="space-y-4">
        <div className="h-4 bg-neutral-200 rounded w-3/4" />
        <div className="h-4 bg-neutral-200 rounded w-1/2" />
        <div className="h-4 bg-neutral-200 rounded w-5/6" />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="animate-pulse">
      <div className="bg-neutral-50 rounded-t-xl p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-neutral-200 rounded w-3/4" />
          ))}
        </div>
      </div>
      <div className="bg-white rounded-b-xl divide-y divide-neutral-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-neutral-200 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonProductCard() {
  return (
    <div className="animate-pulse bg-white rounded-xl shadow-soft overflow-hidden">
      <div className="h-48 bg-neutral-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-neutral-200 rounded w-3/4" />
        <div className="h-4 bg-neutral-200 rounded w-1/2" />
        <div className="h-6 bg-neutral-200 rounded w-1/3" />
        <div className="h-10 bg-neutral-200 rounded" />
      </div>
    </div>
  )
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse bg-white rounded-xl shadow-soft p-6">
          <div className="space-y-3">
            <div className="h-4 bg-neutral-200 rounded w-2/3" />
            <div className="h-8 bg-neutral-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Default export for backward compatibility
export default SkeletonCard