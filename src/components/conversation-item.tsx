"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface ConversationItemProps {
  username: string
  message: string
  type: string
  time: string
  date: string
  isOnline?: boolean
  isActive?: boolean
  onClick?: () => void
}

export function ConversationItem({
  username,
  message,
  type,
  time,
  date,
  isOnline = false,
  isActive = false,
  onClick,
}: ConversationItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 p-4 rounded-xl transition-all duration-200 text-left",
        "hover:bg-secondary/80",
        isActive && "bg-secondary ring-1 ring-primary/20",
      )}
    >
      <div className="relative">
        <Avatar className="h-11 w-11 ring-2 ring-border">
          <AvatarFallback className="bg-secondary text-foreground font-medium">
            {username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {isOnline && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success ring-2 ring-card" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-semibold text-foreground truncate">{username}</span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{date}</span>
        </div>
        <p className="text-sm text-muted-foreground truncate mb-1.5">{message}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-primary">{type}</span>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
      </div>
    </button>
  )
}
