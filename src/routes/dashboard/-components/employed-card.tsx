import { Briefcase } from 'lucide-react'
import { formatPercentage } from '../../../lib/formatters'
import type { RateResult } from '../-types/analytics.types'

interface EmployedCardProps {
  data: RateResult
}

export function EmployedCard({ data }: EmployedCardProps) {
  return (
    <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">Employed</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">
            {formatPercentage(data.rate)}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {data.employed ?? 0} of {data.total} employed
          </p>
        </div>
        <Briefcase className="h-8 w-8 text-info" />
      </div>
    </div>
  )
}