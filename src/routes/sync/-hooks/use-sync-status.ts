import { useEffect } from 'react'
import { useSyncStore } from '../../../stores/sync.store'

export function useSyncStatus() {
  const { status, refreshStatus, operation } = useSyncStore()

  useEffect(() => {
    refreshStatus()
  }, [refreshStatus])

  return {
    pendingCount: status?.pendingCount ?? 0,
    conflictCount: status?.conflictCount ?? 0,
    isOnline: status?.isOnline ?? false,
    operation,
  }
}
