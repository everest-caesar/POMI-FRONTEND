import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  icon?: LucideIcon
  value: number | string
  label: string
  suffix?: string
  color?: 'orange' | 'emerald' | 'amber' | 'rose' | 'violet' | 'sky'
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatsCard({
  icon: Icon,
  value,
  label,
  suffix = '',
  color = 'orange',
  trend,
}: StatsCardProps) {
  const colorClasses = {
    orange: 'from-orange-500 to-orange-600 text-orange-500',
    emerald: 'from-emerald-500 to-emerald-600 text-emerald-500',
    amber: 'from-amber-500 to-amber-600 text-amber-500',
    rose: 'from-rose-500 to-rose-600 text-rose-500',
    violet: 'from-violet-500 to-violet-600 text-violet-500',
    sky: 'from-sky-500 to-sky-600 text-sky-500',
  }

  const gradientClass = colorClasses[color].split(' ').slice(0, 2).join(' ')
  const textColorClass = colorClasses[color].split(' ')[2]

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:border-slate-700 transition-colors">
      <div className="flex items-center gap-3 mb-2">
        {Icon && (
          <div className={`p-2 rounded-lg bg-gradient-to-br ${gradientClass}`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        )}
        <span className="text-sm font-medium text-slate-400">{label}</span>
      </div>

      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${textColorClass}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {suffix && <span className={`text-lg font-semibold ${textColorClass}`}>{suffix}</span>}
      </div>

      {trend && (
        <div className={`mt-2 text-xs font-medium ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last week
        </div>
      )}
    </div>
  )
}

// Grid wrapper for multiple stats
interface StatsGridProps {
  children: ReactNode
  columns?: 2 | 3 | 4
}

export function StatsGrid({ children, columns = 3 }: StatsGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={`grid gap-4 ${gridCols[columns]}`}>
      {children}
    </div>
  )
}

export default StatsCard
