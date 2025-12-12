interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'profile' | 'default'
  count?: number
}

export function LoadingSkeleton({ variant = 'default', count = 1 }: LoadingSkeletonProps) {
  const items = Array.from({ length: count })

  if (variant === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((_, idx) => (
          <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden animate-pulse">
            <div className="h-40 bg-slate-800" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-800 rounded w-1/2" />
              <div className="h-8 bg-slate-800 rounded mt-4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <div className="space-y-4">
        {items.map((_, idx) => (
          <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-800 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-800 rounded w-1/3" />
                <div className="h-3 bg-slate-800 rounded w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'profile') {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 animate-pulse">
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 bg-slate-800 rounded-full" />
          <div className="h-6 bg-slate-800 rounded w-32" />
          <div className="h-4 bg-slate-800 rounded w-48" />
        </div>
        <div className="mt-6 space-y-4">
          <div className="h-10 bg-slate-800 rounded" />
          <div className="h-10 bg-slate-800 rounded" />
          <div className="h-20 bg-slate-800 rounded" />
        </div>
      </div>
    )
  }

  // Default skeleton
  return (
    <div className="space-y-4 animate-pulse">
      {items.map((_, idx) => (
        <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="space-y-3">
            <div className="h-4 bg-slate-800 rounded w-3/4" />
            <div className="h-4 bg-slate-800 rounded w-1/2" />
            <div className="h-4 bg-slate-800 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default LoadingSkeleton
