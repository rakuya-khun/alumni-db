import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { NetworkStatus } from './-components/network-status'
import { SyncStatus } from './-components/sync-status'
import { SyncActions } from './-components/sync-actions'
import { SyncProgress } from './-components/sync-progress'
import { UnpushedNotification } from './-components/unpushed-notification'
import { PendingChangesList } from './-components/pending-changes-list'
import { ConflictList } from './-components/conflict-list'
import { ConflictResolver } from './-components/conflict-resolver'
import { AutoSyncConfig } from './-components/auto-sync-config'
import type { ConflictRecord } from '../../../shared/types/sync.types'

export default function SyncPage() {
  const [activeConflict, setActiveConflict] = useState<ConflictRecord | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Data Synchronization</h1>
          <p className="text-sm text-text-secondary">Sync alumni data between local database and Google Sheets</p>
        </div>
        <NetworkStatus />
      </div>

      <UnpushedNotification />
      <SyncProgress />

      <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw className="h-5 w-5 text-text-secondary" />
          <h2 className="text-sm font-semibold text-text-primary">Sync Actions</h2>
        </div>
        <SyncStatus />
        <SyncActions />
      </div>

      <AutoSyncConfig />
      <PendingChangesList />
      <ConflictList onResolve={setActiveConflict} />

      {activeConflict && (
        <ConflictResolver
          conflict={activeConflict}
          onClose={() => setActiveConflict(null)}
        />
      )}
    </div>
  )
}
