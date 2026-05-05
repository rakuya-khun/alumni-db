import type { ReactNode } from 'react'
import { formatPercentage } from '../../../../lib/formatters'
import { InsufficientDataBadge } from './insufficient-data-badge'
import type { PeoCohortRate } from '../../../../../shared/types/peo.types'

interface CohortCardProps {
  title: string
  subtitle: string
  icon: ReactNode
  data: PeoCohortRate
}

export function CohortCard({ title, subtitle, icon, data }: CohortCardProps) {
  return (
    <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">{formatPercentage(data.rate)}</p>
          <p className="mt-1 text-xs text-text-muted">
            {data.aligned} of {data.total} aligned — {subtitle}
          </p>
          {data.insufficient && (
            <div className="mt-2">
              <InsufficientDataBadge n={data.total} />
            </div>
          )}
        </div>
        <div className="ml-3 flex-shrink-0 text-primary">{icon}</div>
      </div>
    </div>
  )
}
