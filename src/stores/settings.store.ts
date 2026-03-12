import { create } from 'zustand'
import { ipcClient } from '../data/ipc-client'
import type { AccountEntry } from '../../shared/types/auth.types'

interface SettingsState {
  config: Record<string, string | null>
  isConfigured: boolean
  configSkipped: boolean
  accounts: AccountEntry[]
  loading: boolean
  saving: boolean
  accountsLoading: boolean
  error: string | null
  loadSettings: () => Promise<void>
  saveSettings: (settings: Record<string, string>) => Promise<void>
  testSmtp: () => Promise<void>
  testSheets: () => Promise<void>
  loadAccounts: () => Promise<void>
  createAccount: (data: Record<string, unknown>) => Promise<void>
  updateAccount: (data: Record<string, unknown>) => Promise<void>
  skipConfig: () => void
  clearError: () => void
  reset: () => void
}

let _loading = false
let _loaded = false
let _accountsLoading = false

export const useSettingsStore = create<SettingsState>((set, get) => ({
  config: {},
  isConfigured: false,
  configSkipped: false,
  accounts: [],
  loading: false,
  saving: false,
  accountsLoading: false,
  error: null,

  loadSettings: async () => {
    if (_loading || _loaded) return
    _loading = true
    set({ loading: true, error: null })
    try {
      const config = await ipcClient.settings.get()
      const hasSheets = !!(config.sheets_id && config.sheets_key)
      set({ config, isConfigured: hasSheets, loading: false })
      _loaded = true
    } catch (err) {
      set({ loading: false, error: (err as Error).message })
      _loaded = true // Don't retry automatically — user can retry via save
    } finally {
      _loading = false
    }
  },

  saveSettings: async (settings) => {
    set({ saving: true, error: null })
    try {
      await ipcClient.settings.save(settings)
      // Silently refresh config without triggering loading state
      const config = await ipcClient.settings.get()
      const hasSheets = !!(config.sheets_id && config.sheets_key)
      set({ config, isConfigured: hasSheets, saving: false })
    } catch (err) {
      set({ saving: false, error: (err as Error).message })
      throw err
    }
  },

  testSmtp: async () => {
    await ipcClient.settings.testSmtp()
  },

  testSheets: async () => {
    await ipcClient.settings.testSheets()
  },

  loadAccounts: async () => {
    if (_accountsLoading) return
    _accountsLoading = true
    set({ accountsLoading: true, error: null })
    try {
      const accounts = await ipcClient.auth.getAccounts()
      set({ accounts, accountsLoading: false })
    } catch (err) {
      set({ accountsLoading: false, error: (err as Error).message })
    } finally {
      _accountsLoading = false
    }
  },

  createAccount: async (data) => {
    await ipcClient.auth.createAccount(data)
    await get().loadAccounts()
  },

  updateAccount: async (data) => {
    await ipcClient.auth.updateAccount(data)
    await get().loadAccounts()
  },

  skipConfig: () => set({ configSkipped: true }),

  clearError: () => set({ error: null }),

  reset: () => {
    _loaded = false
    _loading = false
    _accountsLoading = false
    set({
      config: {},
      isConfigured: false,
      configSkipped: false,
      accounts: [],
      loading: false,
      saving: false,
      accountsLoading: false,
      error: null,
    })
  },
}))
