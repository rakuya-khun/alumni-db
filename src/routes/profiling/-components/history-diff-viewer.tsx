import { ArrowRight } from 'lucide-react'
import type { FieldDiff } from '../-types/profiling.types'

interface HistoryDiffViewerProps {
  diffs: FieldDiff[]
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '(empty)'
  return String(value)
}

export function HistoryDiffViewer({ diffs }: HistoryDiffViewerProps) {
  if (diffs.length === 0) {
    return <p className="text-sm text-text-secondary">No changes detected</p>
  }

  return (
    <div className="space-y-2">
      {diffs.map((diff) => (
        <div
          key={diff.field}
          className="flex flex-wrap items-center gap-2 rounded-lg border border-card-border bg-surface-secondary px-4 py-3 text-sm"
        >
          <span className="font-medium text-text-primary min-w-[140px]">{diff.label}</span>
          <span className="rounded bg-error/10 px-2 py-0.5 text-error line-through">
            {formatValue(diff.before)}
          </span>
          <ArrowRight className="h-3 w-3 text-text-secondary" />
          <span className="rounded bg-success/10 px-2 py-0.5 text-success">
            {formatValue(diff.after)}
          </span>
        </div>
      ))}
    </div>
  )
}
