import { useEffect } from 'react'
import { useAlumniStore } from '../../../stores/alumni.store'
import { useAuth } from '../../../hooks/use-auth'
import type { AlumniFilters } from '../../../../shared/types/alumni.types'

export function useAlumni(filters?: AlumniFilters) {
  const { accessiblePrograms } = useAuth()
  const store = useAlumniStore()

  useEffect(() => {
    // Intersect user-selected programs with role-accessible programs
    let programs: string[] | undefined
    if (filters?.programs && filters.programs.length > 0 && accessiblePrograms.length > 0) {
      programs = filters.programs.filter((p) => accessiblePrograms.includes(p))
      if (programs.length === 0) programs = accessiblePrograms
    } else if (accessiblePrograms.length > 0) {
      programs = accessiblePrograms
    } else {
      programs = filters?.programs
    }

    const merged: AlumniFilters = {
      ...filters,
      programs: programs && programs.length > 0 ? programs : undefined,
    }
    store.fetchAll(merged)
  }, [filters, accessiblePrograms]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    alumni: store.list,
    loading: store.loading,
    error: store.error,
    create: store.create,
    update: store.update,
    remove: store.remove,
    search: store.search,
    refresh: () => store.fetchAll(),
    clearError: store.clearError,
  }
}