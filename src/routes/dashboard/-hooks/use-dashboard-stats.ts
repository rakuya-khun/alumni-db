import { useEffect } from 'react'
import { useAnalyticsStore } from '../../../stores/analytics.store'
import { useAuth } from '../../../hooks/use-auth'

export function useDashboardStats() {
  const { accessiblePrograms } = useAuth()
  const { dashboardStats, loading, error, fetchDashboard, clearError } = useAnalyticsStore()

  useEffect(() => {
    fetchDashboard(accessiblePrograms.length > 0 ? accessiblePrograms : undefined)
  }, [accessiblePrograms, fetchDashboard])

  return { stats: dashboardStats, loading, error, refresh: fetchDashboard, clearError }
}
