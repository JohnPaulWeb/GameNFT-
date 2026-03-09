export function NftCardSkeleton() {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl">
      {/* Image skeleton */}
      <div className="relative aspect-square w-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02]">
        <div className="absolute inset-0 shimmer" />
      </div>
      
      {/*ito yung  Content skeleton */}
      <div className="p-4 space-y-3">
        {/*ito yung Title skeleton */}
        <div className="space-y-2">
          <div className="h-6 w-3/4 rounded-lg bg-white/10 shimmer" />
          <div className="h-4 w-full rounded-lg bg-white/5 shimmer" />
          <div className="h-4 w-2/3 rounded-lg bg-white/5 shimmer" />
        </div>
        
        {/*ito yung Price skeleton */}
        <div className="rounded-xl bg-white/5 p-3">
          <div className="h-8 w-24 rounded-lg bg-white/10 shimmer" />
        </div>
      </div>
      
      {/*ito yung Footer skeleton */}
      <div className="border-t border-white/10 p-4">
        <div className="h-10 w-full rounded-lg bg-white/10 shimmer" />
      </div>
    </div>
  );
}

export function NftGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    // ito yung  Grid Container
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <NftCardSkeleton key={i} />
      ))}
    </div>
  );
}
