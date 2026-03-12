import { Target } from 'lucide-react'
import { formatPercentage } from '../../../lib/formatters'

interface FieldRelatedCardProps {
  data: { employed: number; fieldRelated: number; rate: number }
}

export function FieldRelatedCard({ data }: FieldRelatedCardProps) {
  return (
    <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">Field-Related Work</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">
            {formatPercentage(data.rate)}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {data.fieldRelated} of {data.employed} in related field
          </p>
        </div>
        <Target className="h-8 w-8 text-warning" />
      </div>
    </div>
  )
}