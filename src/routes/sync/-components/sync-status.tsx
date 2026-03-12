import { Clock, AlertCircle, CloudOff } from 'lucide-react'
import { useSyncStatus } from '../-hooks/use-sync-status'
import { formatDateTime } from '../../../lib/formatters'
import { useSyncStore } from '../../../stores/sync.store'

export function SyncStatus() {
  const { pendingCount, conflictCount } = useSyncStatus()
  const { lastResult } = useSyncStore()

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Clock className="h-4 w-4" />
        <span>Last sync: {lastResult ? formatDateTime(new Date().toISOString()) : 'Never'}</span>
      </div>
      {pendingCount > 0 && (
        <div className="flex items-center gap-2 rounded-full bg-warning/10 px-3 py-1 text-sm font-medium text-warning">
          <CloudOff className="h-3.5 w-3.5" />
          {pendingCount} pending
        </div>
      )}
      {conflictCount > 0 && (
        <div className="flex items-center gap-2 rounded-full bg-error/10 px-3 py-1 text-sm font-medium text-error">
          <AlertCircle className="h-3.5 w-3.5" />
          {conflictCount} conflict{conflictCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
