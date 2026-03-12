import { Download, Upload, RefreshCw } from 'lucide-react'
import { useSync } from '../-hooks/use-sync'
import { cn } from '../../../lib/cn'

export function SyncActions() {
  const { pull, push, fullSync, operation, isOnline } = useSync()
  const busy = operation !== 'idle'

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={pull}
        disabled={busy || !isOnline}
        className={cn(
          'inline-flex h-10 items-center gap-2 rounded-lg px-6 text-sm font-medium transition-colors',
          'bg-primary text-primary-foreground hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <Download className="h-4 w-4" />
        Pull from Sheets
      </button>
      <button
        type="button"
        onClick={push}
        disabled={busy || !isOnline}
        className={cn(
          'inline-flex h-10 items-center gap-2 rounded-lg px-6 text-sm font-medium transition-colors',
          'border border-primary text-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <Upload className="h-4 w-4" />
        Push to Sheets
      </button>
      <button
        type="button"
        onClick={fullSync}
        disabled={busy || !isOnline}
        className={cn(
          'inline-flex h-10 items-center gap-2 rounded-lg px-6 text-sm font-medium transition-colors',
          'border border-card-border text-text-primary hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <RefreshCw className="h-4 w-4" />
        Full Sync
      </button>
    </div>
  )
}
