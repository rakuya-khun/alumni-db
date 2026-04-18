import { Award } from 'lucide-react'
import { formatPercentage } from '../../../lib/formatters'
import type { RateResult } from '../-types/analytics.types'

interface BoardPassersCardProps {
  data: RateResult
}

export function BoardPassersCard({ data }: BoardPassersCardProps) {
  const notApplicable = data.total === 0

  return (
    <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">Board Passers</p>
          {notApplicable ? (
            <p className="mt-1 text-lg font-semibold text-text-muted">N/A</p>
          ) : (
            <>
              <p className="mt-1 text-2xl font-bold text-text-primary">
                {formatPercentage(data.rate)}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                {data.passers ?? 0} of {data.total} licensed
              </p>
            </>
          )}
          <p className="mt-1 text-xs text-text-muted italic">
            {notApplicable ? 'Not applicable for Computer Engineering' : 'Civil & Electrical Engineering only'}
          </p>
        </div>
        <Award className="h-8 w-8 text-success" />
      </div>
    </div>
  )
}