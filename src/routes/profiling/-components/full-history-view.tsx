import { Clock } from 'lucide-react'
import type { HistoryEntry, FieldDiff } from '../-types/profiling.types'
import { HistoryDiffViewer } from './history-diff-viewer'
import { formatDateTime } from '../../../lib/formatters'

interface FullHistoryViewProps {
  entries: HistoryEntry[]
  diffsPerEntry: Map<number, FieldDiff[]>
}

export function FullHistoryView({ entries, diffsPerEntry }: FullHistoryViewProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-card-border bg-card p-8 text-center">
        <p className="text-text-secondary">No update history found for this alumni record.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, idx) => (
        <div key={entry.id} className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-text-secondary" />
            <span className="text-sm font-medium text-text-primary">
              Update #{entries.length - idx}
            </span>
            <span className="text-sm text-text-secondary">
              — {formatDateTime(entry.createdAt)}
            </span>
            <span className="ml-auto text-xs text-text-secondary">
              {entry.changedFields.length} field{entry.changedFields.length !== 1 ? 's' : ''} changed
            </span>
          </div>
          <HistoryDiffViewer diffs={diffsPerEntry.get(entry.id) ?? []} />
        </div>
      ))}
    </div>
  )
}
