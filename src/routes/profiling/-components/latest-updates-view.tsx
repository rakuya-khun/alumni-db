import { Sparkles } from 'lucide-react'
import type { HistoryEntry, FieldDiff } from '../-types/profiling.types'
import { HistoryDiffViewer } from './history-diff-viewer'
import { formatDateTime } from '../../../lib/formatters'

interface LatestUpdatesViewProps {
  latest: HistoryEntry | null
  diffs: FieldDiff[]
}

export function LatestUpdatesView({ latest, diffs }: LatestUpdatesViewProps) {
  if (!latest) {
    return (
      <div className="rounded-xl border border-card-border bg-card p-8 text-center">
        <p className="text-text-secondary">No updates have been recorded yet.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-text-primary">Latest Update</span>
        <span className="text-sm text-text-secondary">
          — {formatDateTime(latest.createdAt)}
        </span>
      </div>
      <p className="mb-4 text-sm text-text-secondary">
        {diffs.length} field{diffs.length !== 1 ? 's' : ''} changed in this update
      </p>
      <HistoryDiffViewer diffs={diffs} />
    </div>
  )
}
