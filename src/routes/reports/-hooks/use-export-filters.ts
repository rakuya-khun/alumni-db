import { useState, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import type { ExportFilterData } from '../-schemas/export-filter.schema'

export function useExportFilters() {
  const { accessiblePrograms } = useAuth()
  const [filters, setFilters] = useState<ExportFilterData>({
    programs: accessiblePrograms,
  })

  const updateFilters = useCallback((patch: Partial<ExportFilterData>) => {
    setFilters((prev) => ({ ...prev, ...patch }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({ programs: accessiblePrograms })
  }, [accessiblePrograms])

  return { filters, updateFilters, resetFilters, accessiblePrograms }
}
