import { useSettingsStore } from '@/stores/settings.store'

export function useSettings() {
  // Use selectors to avoid full-store subscription re-renders.
  // loadSettings is already called by AppInit on startup — no useEffect needed.
  const config = useSettingsStore((s) => s.config)
  const isConfigured = useSettingsStore((s) => s.isConfigured)
  const loading = useSettingsStore((s) => s.loading)
  const saving = useSettingsStore((s) => s.saving)
  const error = useSettingsStore((s) => s.error)
  const save = useSettingsStore((s) => s.saveSettings)
  const testSmtp = useSettingsStore((s) => s.testSmtp)
  const testSheets = useSettingsStore((s) => s.testSheets)
  const clearError = useSettingsStore((s) => s.clearError)

  return { config, isConfigured, loading, saving, error, save, testSmtp, testSheets, clearError }
}
