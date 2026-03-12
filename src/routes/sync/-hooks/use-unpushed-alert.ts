import { useSyncStatus } from './use-sync-status'

export function useUnpushedAlert() {
  const { pendingCount } = useSyncStatus()

  return {
    hasUnpushed: pendingCount > 0,
    unpushedCount: pendingCount,
  }
}
