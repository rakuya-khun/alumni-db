import { WifiOff } from 'lucide-react'

export function OfflineBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
      <WifiOff size={14} />
      <span>Offline Mode</span>
    </div>
  )
}
