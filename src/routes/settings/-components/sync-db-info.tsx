import { Database, HardDrive, Clock } from 'lucide-react'

interface SyncDbInfoProps {
  config: Record<string, string | null>
}

export function SyncDbInfo({ config }: SyncDbInfoProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Database & Sync Info</h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border border-card-border p-4">
          <Database className="h-5 w-5 text-text-secondary" />
          <div>
            <p className="text-xs text-text-muted">Database File</p>
            <p className="text-sm font-medium text-text-primary">{config.db_path || 'alumni.db'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-card-border p-4">
          <HardDrive className="h-5 w-5 text-text-secondary" />
          <div>
            <p className="text-xs text-text-muted">Database Size</p>
            <p className="text-sm font-medium text-text-primary">{config.db_size || 'N/A'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-card-border p-4">
          <Clock className="h-5 w-5 text-text-secondary" />
          <div>
            <p className="text-xs text-text-muted">Last Backup</p>
            <p className="text-sm font-medium text-text-primary">{config.last_backup || 'Never'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
