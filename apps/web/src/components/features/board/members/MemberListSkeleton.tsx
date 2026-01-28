export function MemberListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10" />
          <div className="flex-1">
            <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-24 mb-1" />
            <div className="h-3 bg-black/10 dark:bg-white/10 rounded w-32" />
          </div>
        </div>
      ))}
    </div>
  )
}
