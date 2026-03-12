import { useEffect, useState } from 'react'
import { Activity, UserPlus, RefreshCw, Mail } from 'lucide-react'
import { formatDateTime } from '../../../lib/formatters'
import { ipcClient } from '../../../data/ipc-client'

interface ActivityItem {
  id: string
  type: 'addition' | 'sync' | 'email'
  description: string
  timestamp: string
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadActivity = async () => {
      try {
        const [alumni, syncStatus] = await Promise.all([
          ipcClient.alumni.getAll().catch(() => []),
          ipcClient.sync.getStatus().catch(() => null),
        ])

        if (!mounted) return

        const items: ActivityItem[] = []

        // Recent alumni additions (last 5)
        const alumniList = Array.isArray(alumni) ? alumni : []
        const sorted = alumniList
          .filter((a) => a && typeof a === 'object' && a.id && a.full_name && a.created_at)
          .sort((a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime())
          .slice(0, 5)

        for (const a of sorted) {
          items.push({
            id: `alumni-${a.id}`,
            type: 'addition',
            description: `Added record: ${a.full_name}`,
            timestamp: a.created_at as string,
          })
        }

        if (syncStatus && typeof syncStatus === 'object' && 'lastSyncAt' in syncStatus) {
          const s = syncStatus as { lastSyncAt?: string }
          if (s.lastSyncAt) {
            items.push({
              id: 'sync-last',
              type: 'sync',
              description: 'Data synchronized with Google Sheets',
              timestamp: s.lastSyncAt,
            })
          }
        }

        items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        setActivities(items.slice(0, 8))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadActivity()
    return () => { mounted = false }
  }, [])

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'addition': return <UserPlus className="h-4 w-4 text-success" />
      case 'sync': return <RefreshCw className="h-4 w-4 text-info" />
      case 'email': return <Mail className="h-4 w-4 text-warning" />
    }
  }

  return (
    <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-text-secondary" />
        <h3 className="text-lg font-semibold text-text-primary">Recent Activity</h3>
      </div>

      {loading ? (
        <p className="text-sm text-text-muted">Loading activity...</p>
      ) : activities.length === 0 ? (
        <p className="text-sm text-text-muted">No recent activity.</p>
      ) : (
        <ul className="space-y-3">
          {activities.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <div className="mt-0.5">{getIcon(item.type)}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text-primary">{item.description}</p>
                <p className="text-xs text-text-muted">{formatDateTime(item.timestamp)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}