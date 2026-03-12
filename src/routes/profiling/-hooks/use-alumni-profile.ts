import { useEffect } from 'react'
import { useProfilingStore } from '../../../stores/profiling.store'
import { useAuth } from '../../../hooks/use-auth'

export function useAlumniProfile(id: number | undefined) {
  const { selectedProfile, history, loading, error, fetchProfile, fetchHistory, clearProfile, clearError } =
    useProfilingStore()
  const { accessiblePrograms } = useAuth()

  useEffect(() => {
    if (!id) return
    clearError()
    fetchProfile(id)
    fetchHistory(id)
    return () => clearProfile()
  }, [id, fetchProfile, fetchHistory, clearProfile, clearError])

  const isAccessible =
    !selectedProfile || accessiblePrograms.includes(selectedProfile.program)

  return { profile: selectedProfile, history, loading, error, isAccessible }
}
