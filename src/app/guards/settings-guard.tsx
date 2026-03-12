import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSettingsStore } from '../../stores/settings.store'

export function SettingsGuard() {
  const isConfigured = useSettingsStore((s) => s.isConfigured)
  const configSkipped = useSettingsStore((s) => s.configSkipped)
  const loading = useSettingsStore((s) => s.loading)
  const location = useLocation()

  // Wait for settings to load before making any redirect decisions
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-secondary">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-text-secondary">Loading settings...</p>
        </div>
      </div>
    )
  }

  // Allow access to settings page even when not configured
  // Also allow navigation if user explicitly skipped configuration
  if (!isConfigured && !configSkipped && location.pathname !== '/settings') {
    return <Navigate to="/settings" replace />
  }

  return <Outlet />
}
