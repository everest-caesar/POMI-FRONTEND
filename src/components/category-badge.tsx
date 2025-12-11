"use client"

import { cn } from "@/lib/utils"

interface CategoryBadgeProps {
  icon: string
  label: string
  isActive?: boolean
  onClick?: () => void
}

export function CategoryBadge({ icon, label, isActive = false, onClick }: CategoryBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      )}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  )
}
