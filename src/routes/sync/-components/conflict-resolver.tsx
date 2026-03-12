import { useState } from 'react'
import { X, ArrowRight } from 'lucide-react'
import type { ConflictRecord } from '../../../../shared/types/sync.types'
import { useConflicts } from '../-hooks/use-conflicts'
import { cn } from '../../../lib/cn'

interface ConflictResolverProps {
  conflict: ConflictRecord
  onClose: () => void
}

export function ConflictResolver({ conflict, onClose }: ConflictResolverProps) {
  const { resolve } = useConflicts()
  const [resolving, setResolving] = useState(false)

  const handleResolve = async (resolution: 'local' | 'remote') => {
    setResolving(true)
    await resolve(conflict.id, resolution)
    setResolving(false)
    onClose()
  }

  const allKeys = new Set([
    ...Object.keys(conflict.localData),
    ...Object.keys(conflict.remoteData ?? {}),
  ])
  const skipKeys = new Set(['id', 'created_at', 'updated_at', 'synced_at', 'sync_status'])
  const fields = [...allKeys].filter((k) => !skipKeys.has(k))

  const diffFields = fields.filter((k) => {
    const local = String(conflict.localData[k] ?? '')
    const remote = String((conflict.remoteData ?? {})[k] ?? '')
    return local !== remote
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-3xl rounded-xl bg-card p-6 shadow-xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">
            Resolve Conflict: {conflict.fullName}
          </h3>
          <button type="button" onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-text-secondary">
          {diffFields.length} field{diffFields.length !== 1 ? 's' : ''} differ between local and remote versions.
        </p>

        {diffFields.length > 0 && (
          <div className="mb-6 space-y-2">
            {diffFields.map((key) => (
              <div key={key} className="flex items-center gap-3 rounded-lg bg-surface-secondary px-4 py-3 text-sm">
                <span className="min-w-[140px] font-medium text-text-primary">{key}</span>
                <span className="rounded bg-primary/10 px-2 py-0.5 text-primary">
                  {String(conflict.localData[key] ?? '(empty)')}
                </span>
                <ArrowRight className="h-3 w-3 text-text-secondary" />
                <span className="rounded bg-info/10 px-2 py-0.5 text-info">
                  {String((conflict.remoteData ?? {})[key] ?? '(empty)')}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            disabled={resolving}
            onClick={() => handleResolve('local')}
            className={cn(
              'flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors',
              'bg-primary text-primary-foreground hover:bg-primary-light disabled:opacity-50'
            )}
          >
            Keep Local
          </button>
          <button
            type="button"
            disabled={resolving}
            onClick={() => handleResolve('remote')}
            className={cn(
              'flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors',
              'border border-card-border text-text-primary hover:bg-surface-secondary disabled:opacity-50'
            )}
          >
            Keep Remote
          </button>
        </div>
      </div>
    </div>
  )
}
