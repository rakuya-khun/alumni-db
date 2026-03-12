import { Loader2 } from 'lucide-react'
import { useSyncStore } from '../../../stores/sync.store'

const LABELS: Record<string, string> = {
  idle: '',
  pulling: 'Pulling data from Google Sheets...',
  pushing: 'Pushing local changes to Google Sheets...',
  syncing: 'Running full synchronization...',
}

export function SyncProgress() {
  const { operation } = useSyncStore()

  if (operation === 'idle') return null

  return (
    <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <span className="text-sm font-medium text-text-primary">{LABELS[operation]}</span>
    </div>
  )
}
