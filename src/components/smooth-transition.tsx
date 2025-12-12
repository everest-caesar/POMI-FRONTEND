import { ReactNode } from 'react'

interface SmoothTransitionProps {
  children: ReactNode
  className?: string
}

export function SmoothTransition({ children, className = '' }: SmoothTransitionProps) {
  return (
    <div
      className={`animate-in fade-in slide-in-from-bottom-4 duration-500 ${className}`}
    >
      {children}
    </div>
  )
}

export default SmoothTransition
