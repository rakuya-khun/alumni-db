interface PeoIndicatorRowProps {
  label: string
  count: number
  denominator: number
}

export function PeoIndicatorRow({ label, count, denominator }: PeoIndicatorRowProps) {
  const pct = denominator > 0 ? (count / denominator) * 100 : 0
  return (
    <div className="flex items-center justify-between border-b border-card-border py-2 last:border-b-0">
      <span className="text-sm text-text-primary">{label}</span>
      <span className="text-sm font-medium text-text-secondary">
        {count} / {denominator} <span className="text-text-muted">({pct.toFixed(1)}%)</span>
      </span>
    </div>
  )
}
