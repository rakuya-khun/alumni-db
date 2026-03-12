import { useState } from 'react'
import { ChevronDown, ChevronRight, Clock } from 'lucide-react'
import type { HistoryEntry, FieldDiff } from '../-types/profiling.types'
import { HistoryDiffViewer } from './history-diff-viewer'
import { formatDateTime } from '../../../lib/formatters'
import { cn } from '../../../lib/cn'

interface AlumniHistoryTimelineProps {
  entries: HistoryEntry[]
  diffsPerEntry: Map<number, FieldDiff[]>
}

export function AlumniHistoryTimeline({ entries, diffsPerEntry }: AlumniHistoryTimelineProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-card-border bg-card p-8 text-center">
        <p className="text-text-secondary">No timeline entries available.</p>
      </div>
    )
  }

  const toggle = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="relative pl-6">
      {/* Timeline line */}
      <div className="absolute left-2.5 top-0 bottom-0 w-px bg-card-border" />

      <div className="space-y-4">
        {entries.map((entry, idx) => {
          const isOpen = expanded.has(entry.id)
          const diffs = diffsPerEntry.get(entry.id) ?? []
          return (
            <div key={entry.id} className="relative">
              {/* Timeline dot */}
              <div
                className={cn(
                  'absolute -left-6 top-4 h-3 w-3 rounded-full border-2',
                  idx === 0
                    ? 'border-primary bg-primary'
                    : 'border-card-border bg-surface-primary'
                )}
              />

              <button
                type="button"
                onClick={() => toggle(entry.id)}
                className="flex w-full items-start gap-3 rounded-xl border border-card-border bg-card p-4 text-left shadow-sm transition-colors hover:bg-surface-secondary"
              >
                {isOpen ? (
                  <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary" />
                ) : (
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-text-secondary" />
                    <span className="text-sm font-medium text-text-primary">
                      {formatDateTime(entry.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">
                    {entry.changedFields.length} field{entry.changedFields.length !== 1 ? 's' : ''} changed
                  </p>
                </div>
              </button>

              {isOpen && (
                <div className="mt-2 ml-7">
                  <HistoryDiffViewer diffs={diffs} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
