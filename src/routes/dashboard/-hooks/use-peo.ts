import { useEffect } from 'react'
import { usePeoStore } from '../../../stores/peo.store'
import { useAuth } from '../../../hooks/use-auth'
import type { PeoFilters } from '../../../../shared/types/peo.types'

export function usePeo(filters: PeoFilters) {
  const { accessiblePrograms } = useAuth()
  const { result, outcomes, loading, error, fetch } = usePeoStore()

  // Apply role-based program scoping if user hasn't picked any
  const effective: PeoFilters = {
    ...filters,
    programs:
      filters.programs && filters.programs.length > 0
        ? filters.programs
        : accessiblePrograms.length > 0
          ? accessiblePrograms
          : undefined,
  }

  const key = JSON.stringify(effective)

  useEffect(() => {
    const handle = setTimeout(() => {
      fetch(JSON.parse(key) as PeoFilters)
    }, 300)
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, fetch])

  return { result, outcomes, loading, error, refresh: () => fetch(effective) }
}
