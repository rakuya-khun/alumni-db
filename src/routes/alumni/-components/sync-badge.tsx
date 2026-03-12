import { Cloud, CloudOff, AlertTriangle } from 'lucide-react'
import { cn } from '../../../lib/cn'

const STATUS_CONFIG = {
  synced: {
    label: 'Synced',
    icon: Cloud,
    className: 'bg-success/10 text-success',
  },
  pending: {
    label: 'Pending',
    icon: CloudOff,
    className: 'bg-warning/10 text-warning',
  },
  conflict: {
    label: 'Conflict',
    icon: AlertTriangle,
    className: 'bg-error/10 text-error',
  },
} as const

interface SyncBadgeProps {
  status: 'synced' | 'pending' | 'conflict'
}

export function SyncBadge({ status }: SyncBadgeProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', config.className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  )
}