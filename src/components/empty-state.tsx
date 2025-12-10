import type React from "react"
import { MessageCircle } from "lucide-react"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary mb-6">
        {icon || <MessageCircle className="h-10 w-10 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && <p className="text-sm text-muted-foreground text-center max-w-sm">{description}</p>}
    </div>
  )
}
