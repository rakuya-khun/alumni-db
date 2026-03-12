import { useSyncStore } from '../../../stores/sync.store'
import { useToast } from '../../../hooks/use-toast'

export function useConflicts() {
  const { conflicts, resolveConflict, refreshStatus } = useSyncStore()
  const toast = useToast()

  const resolve = async (id: number, resolution: 'local' | 'remote') => {
    try {
      await resolveConflict(id, resolution)
      await refreshStatus()
      toast.success('Conflict resolved successfully')
    } catch {
      toast.error('Failed to resolve conflict')
    }
  }

  return { conflicts, resolve }
}
