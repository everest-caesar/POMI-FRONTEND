"use client"

import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

interface PomiHeaderProps {
  title: string
  backHref?: string
  backLabel?: string
  username?: string
}

export function PomiHeader({ title, backHref = "/", backLabel = "Back", username = "tennysonkalio" }: PomiHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link to={backHref}>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <span className="text-lg font-bold text-primary-foreground">P</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium tracking-widest text-muted-foreground">POMI</span>
              <span className="text-sm font-semibold text-foreground">{title}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Welcome, <span className="font-medium text-foreground">{username}</span>
          </span>
          <Button variant="secondary" size="sm" className="font-medium">
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
}
