import { useEffect } from 'react'
import { useSettingsStore } from '@/stores/settings.store'

export function useAccounts() {
  const accounts = useSettingsStore((s) => s.accounts)
  const loading = useSettingsStore((s) => s.accountsLoading)
  const error = useSettingsStore((s) => s.error)
  const loadAccounts = useSettingsStore((s) => s.loadAccounts)
  const createAccount = useSettingsStore((s) => s.createAccount)
  const updateAccount = useSettingsStore((s) => s.updateAccount)
  const clearError = useSettingsStore((s) => s.clearError)

  useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  return { accounts, loading, error, createAccount, updateAccount, clearError }
}
