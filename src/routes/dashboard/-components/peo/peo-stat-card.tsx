import type { ReactNode } from 'react'
import { formatPercentage } from '../../../../lib/formatters'
import { InsufficientDataBadge } from './insufficient-data-badge'

interface PeoStatCardProps {
  label: string
  subtitle: string
  icon: ReactNode
  rate: number
  numerator: number
  denominator: number
  insufficient: boolean
  highlighted?: boolean
  onClick: () => void
}

export function PeoStatCard({
  label,
  subtitle,
  icon,
  rate,
  numerator,
  denominator,
  insufficient,
  highlighted = false,
  onClick,
}: PeoStatCardProps) {
  const base =
    'w-full text-left rounded-xl p-6 shadow-sm cursor-pointer transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'

  if (highlighted) {
    return (
      <button type="button" onClick={onClick} className={`${base} bg-primary text-primary-foreground border border-primary`}>
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium opacity-90">{label}</p>
            <p className="mt-1 text-2xl font-bold">{formatPercentage(rate)}</p>
            <p className="mt-1 text-xs opacity-90">
              {numerator} / {denominator} — {subtitle}
            </p>
            {insufficient && (
              <div className="mt-2">
                <InsufficientDataBadge n={denominator} />
              </div>
            )}
          </div>
          <div className="ml-3 flex-shrink-0 opacity-90">{icon}</div>
        </div>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} border border-card-border bg-card`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-secondary">{label}</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">{formatPercentage(rate)}</p>
          <p className="mt-1 text-xs text-text-muted">
            {numerator} / {denominator} — {subtitle}
          </p>
          {insufficient && (
            <div className="mt-2">
              <InsufficientDataBadge n={denominator} />
            </div>
          )}
        </div>
        <div className="ml-3 flex-shrink-0 text-primary">{icon}</div>
      </div>
    </button>
  )
}
