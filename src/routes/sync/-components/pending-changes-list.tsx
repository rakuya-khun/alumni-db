import { CloudOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ipcClient } from '../../../data/ipc-client'
import { useAuth } from '../../../hooks/use-auth'
import type { Alumni } from '../../../../shared/types/alumni.types'

export function PendingChangesList() {
  const { accessiblePrograms } = useAuth()
  const [pending, setPending] = useState<Alumni[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ipcClient.alumni.getAll({ programs: accessiblePrograms, syncStatus: 'pending' })
      .then(setPending)
      .catch(() => setPending([]))
      .finally(() => setLoading(false))
  }, [accessiblePrograms])

  if (loading) return null
  if (pending.length === 0) {
    return (
      <div className="rounded-xl border border-card-border bg-card p-6 text-center">
        <p className="text-sm text-text-secondary">No pending changes. All records are synced.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-card-border bg-card shadow-sm">
      <div className="border-b border-card-border px-6 py-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <CloudOff className="h-4 w-4 text-warning" />
          Pending Changes ({pending.length})
        </h3>
      </div>
      <div className="divide-y divide-card-border">
        {pending.map((a) => (
          <div key={a.id} className="flex items-center justify-between px-6 py-3">
            <div>
              <p className="text-sm font-medium text-text-primary">{a.full_name}</p>
              <p className="text-xs text-text-secondary">{a.program} — Class of {a.year_graduated}</p>
            </div>
            <span className="rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">
              Pending
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
