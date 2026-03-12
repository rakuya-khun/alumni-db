import { AlertCircle } from 'lucide-react'
import { useConflicts } from '../-hooks/use-conflicts'
import type { ConflictRecord } from '../../../../shared/types/sync.types'

interface ConflictListProps {
  onResolve: (conflict: ConflictRecord) => void
}

export function ConflictList({ onResolve }: ConflictListProps) {
  const { conflicts } = useConflicts()

  if (conflicts.length === 0) {
    return null
  }

  return (
    <div className="rounded-xl border border-error/30 bg-card shadow-sm">
      <div className="border-b border-error/20 px-6 py-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-error">
          <AlertCircle className="h-4 w-4" />
          Conflicts ({conflicts.length})
        </h3>
        <p className="mt-1 text-xs text-text-secondary">
          These records have been modified both locally and in Google Sheets. Please resolve each conflict.
        </p>
      </div>
      <div className="divide-y divide-card-border">
        {conflicts.map((c) => (
          <div key={c.id} className="flex items-center justify-between px-6 py-3">
            <div>
              <p className="text-sm font-medium text-text-primary">{c.fullName}</p>
              <p className="text-xs text-text-secondary">{c.program} — Class of {c.yearGraduated}</p>
            </div>
            <button
              type="button"
              onClick={() => onResolve(c)}
              className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-light"
            >
              Resolve
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
