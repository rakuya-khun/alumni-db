import { AlertTriangle } from 'lucide-react'

export function InsufficientDataBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-warning/20 bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
      <AlertTriangle className="h-3 w-3" />
      Insufficient data (n={n})
    </span>
  )
}
