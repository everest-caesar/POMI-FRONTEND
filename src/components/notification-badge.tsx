import { ReactNode } from 'react'

interface NotificationBadgeProps {
  count?: number
  children: ReactNode
  className?: string
  variant?: 'default' | 'dot'
  color?: 'red' | 'orange' | 'emerald'
}

export function NotificationBadge({
  count = 0,
  children,
  className = '',
  variant = 'default',
  color = 'red',
}: NotificationBadgeProps) {
  const colorClasses = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    emerald: 'bg-emerald-500',
  }

  if (count === 0 && variant !== 'dot') {
    return <>{children}</>
  }

  return (
    <div className={`relative inline-flex ${className}`}>
      {children}
      {variant === 'dot' ? (
        <span
          className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ${colorClasses[color]} ring-2 ring-slate-950`}
        />
      ) : (
        <span
          className={`absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full ${colorClasses[color]} px-1 text-xs font-bold text-white ring-2 ring-slate-950`}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
  )
}

export default NotificationBadge
