interface TrendingCommunityProps {
  rank: number
  icon: string
  name: string
  description: string
  threadCount: number
}

export function TrendingCommunity({ rank, icon, name, description, threadCount }: TrendingCommunityProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors duration-200 cursor-pointer">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-sm font-bold text-muted-foreground">
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">{icon}</span>
          <span className="font-semibold text-foreground truncate">{name}</span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-sm font-bold text-foreground">{threadCount}</span>
        <span className="text-xs text-muted-foreground">threads</span>
      </div>
    </div>
  )
}
