import { Wifi, WifiOff } from 'lucide-react'
import { useNetwork } from '../../../hooks/use-network'
import { cn } from '../../../lib/cn'

export function NetworkStatus() {
  const { isOnline } = useNetwork()

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium',
        isOnline
          ? 'bg-success/10 text-success'
          : 'bg-error/10 text-error'
      )}
    >
      {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
      {isOnline ? 'Online' : 'Offline'}
    </div>
  )
}
