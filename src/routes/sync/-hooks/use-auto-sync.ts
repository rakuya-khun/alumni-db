import { useState } from 'react'
import { useSyncStore } from '../../../stores/sync.store'
import { useToast } from '../../../hooks/use-toast'

export function useAutoSync() {
  const { autoSyncEnabled, startAutoSync, stopAutoSync } = useSyncStore()
  const toast = useToast()
  const [interval, setInterval_] = useState(30)

  const toggle = async () => {
    try {
      if (autoSyncEnabled) {
        await stopAutoSync()
        toast.info('Auto-sync stopped')
      } else {
        await startAutoSync(interval)
        toast.success(`Auto-sync started (every ${interval}s)`)
      }
    } catch {
      toast.error('Failed to toggle auto-sync')
    }
  }

  return { autoSyncEnabled, interval, setInterval: setInterval_, toggle }
}
