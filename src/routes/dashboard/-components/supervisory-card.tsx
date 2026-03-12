import { Crown } from 'lucide-react'
import { formatPercentage } from '../../../lib/formatters'

interface SupervisoryCardProps {
  data: { employed: number; supervisory: number; rate: number }
}

export function SupervisoryCard({ data }: SupervisoryCardProps) {
  return (
    <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">Supervisory / Managerial</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">
            {formatPercentage(data.rate)}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {data.supervisory} of {data.employed} in leadership roles
          </p>
        </div>
        <Crown className="h-8 w-8 text-primary" />
      </div>
    </div>
  )
}