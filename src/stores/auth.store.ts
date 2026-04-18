import { create } from 'zustand'
import { ipcClient } from '../data/ipc-client'
import { useSettingsStore } from './settings.store'
import type { UserRole } from '../../shared/types/auth.types'

interface AuthState {
  user: { username: string; role: UserRole; fullName: string; accessiblePrograms: string[] } | null
  isAuthenticated: boolean
  isOffline: boolean
  loading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  restoreSession: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isOffline: false,
  loading: false,
  error: null,

  login: async (username, password) => {
    set({ loading: true, error: null })
    try {
      const result = await ipcClient.auth.login(username, password)
      set({
        user: result.session as AuthState['user'],
        isAuthenticated: true,
        isOffline: result.isOffline,
        loading: false,
      })
      // Reload settings after login (they were cleared on logout)
      useSettingsStore.getState().loadSettings()
    } catch (err) {
      set({ loading: false, error: (err as Error).message })
      throw err
    }
  },

  logout: async () => {
    try {
      await ipcClient.auth.logout()
    } finally {
      useSettingsStore.getState().reset()
      set({ user: null, isAuthenticated: false, isOffline: false, error: null })
    }
  },

  restoreSession: async () => {
    try {
      const session = await ipcClient.auth.getSession()
      if (session) {
        set({ user: session as AuthState['user'], isAuthenticated: true })
      }
    } catch {
      // No active session
    }
  },

  clearError: () => set({ error: null }),
}))
