import type { LucideIcon } from 'lucide-react'

interface FeatureSummaryCardProps {
  icon: LucideIcon
  title: string
  description: string
}

export function FeatureSummaryCard({ icon: Icon, title, description }: FeatureSummaryCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-card-border p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-text-primary">{title}</h4>
        <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
      </div>
    </div>
  )
}
