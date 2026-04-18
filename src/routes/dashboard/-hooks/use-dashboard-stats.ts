import { useEffect } from 'react'
import { useAnalyticsStore } from '../../../stores/analytics.store'
import { useAuth } from '../../../hooks/use-auth'
import type { DashboardFilters } from '../../../../shared/types/analytics.types'

export function useDashboardStats(extraFilters?: { yearFrom?: number; yearTo?: number; programs?: string[] }) {
  const { accessiblePrograms } = useAuth()
  const { dashboardStats, loading, error, fetchDashboard, clearError } = useAnalyticsStore()

  useEffect(() => {
    const filters: DashboardFilters = {
      programs: extraFilters?.programs && extraFilters.programs.length > 0
        ? extraFilters.programs
        : accessiblePrograms.length > 0 ? accessiblePrograms : undefined,
      yearFrom: extraFilters?.yearFrom,
      yearTo: extraFilters?.yearTo,
    }
    fetchDashboard(filters)
  }, [accessiblePrograms, extraFilters?.programs, extraFilters?.yearFrom, extraFilters?.yearTo, fetchDashboard])

  return { stats: dashboardStats, loading, error, refresh: fetchDashboard, clearError }
}
