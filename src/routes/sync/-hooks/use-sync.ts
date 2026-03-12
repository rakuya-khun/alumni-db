import { useSyncStore } from '../../../stores/sync.store'
import { useNetwork } from '../../../hooks/use-network'
import { useToast } from '../../../hooks/use-toast'

export function useSync() {
  const store = useSyncStore()
  const { isOnline } = useNetwork()
  const toast = useToast()

  const pull = async () => {
    if (!isOnline) { toast.error('You are offline. Cannot sync.'); return }
    try {
      const result = await store.pull()
      toast.success(`Pull complete: ${result.pulled} records pulled, ${result.conflicts} conflicts`)
    } catch {
      toast.error('Pull failed. Please try again.')
    }
  }

  const push = async () => {
    if (!isOnline) { toast.error('You are offline. Cannot sync.'); return }
    try {
      const result = await store.push()
      toast.success(`Push complete: ${result.pushed} records pushed`)
    } catch {
      toast.error('Push failed. Please try again.')
    }
  }

  const fullSync = async () => {
    if (!isOnline) { toast.error('You are offline. Cannot sync.'); return }
    try {
      const result = await store.fullSync()
      toast.success(`Full sync complete: ${result.pulled} pulled, ${result.pushed} pushed, ${result.conflicts} conflicts`)
    } catch {
      toast.error('Full sync failed. Please try again.')
    }
  }

  return {
    pull,
    push,
    fullSync,
    operation: store.operation,
    lastResult: store.lastResult,
    error: store.error,
    isOnline,
  }
}
