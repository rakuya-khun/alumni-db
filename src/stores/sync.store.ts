import { create } from 'zustand'
import { ipcClient } from '../data/ipc-client'
import type { SyncResult, SyncStatusInfo, ConflictRecord } from '../../shared/types/sync.types'

type SyncOperation = 'idle' | 'pulling' | 'pushing' | 'syncing'

interface SyncState {
  status: SyncStatusInfo | null
  operation: SyncOperation
  lastResult: SyncResult | null
  conflicts: ConflictRecord[]
  autoSyncEnabled: boolean
  loading: boolean
  error: string | null
  pull: () => Promise<SyncResult>
  push: () => Promise<SyncResult>
  fullSync: () => Promise<SyncResult>
  refreshStatus: () => Promise<void>
  resolveConflict: (id: number, resolution: 'local' | 'remote') => Promise<void>
  startAutoSync: (intervalSeconds?: number) => Promise<void>
  stopAutoSync: () => Promise<void>
  clearError: () => void
}

export const useSyncStore = create<SyncState>((set, get) => ({
  status: null,
  operation: 'idle',
  lastResult: null,
  conflicts: [],
  autoSyncEnabled: false,
  loading: false,
  error: null,

  pull: async () => {
    set({ operation: 'pulling', error: null })
    try {
      const result = await ipcClient.sync.pull()
      set({ lastResult: result, operation: 'idle' })
      await get().refreshStatus()
      return result
    } catch (err) {
      set({ operation: 'idle', error: (err as Error).message })
      throw err
    }
  },

  push: async () => {
    set({ operation: 'pushing', error: null })
    try {
      const result = await ipcClient.sync.push()
      set({ lastResult: result, operation: 'idle' })
      await get().refreshStatus()
      return result
    } catch (err) {
      set({ operation: 'idle', error: (err as Error).message })
      throw err
    }
  },

  fullSync: async () => {
    set({ operation: 'syncing', error: null })
    try {
      const result = await ipcClient.sync.full()
      set({ lastResult: result, operation: 'idle' })
      await get().refreshStatus()
      return result
    } catch (err) {
      set({ operation: 'idle', error: (err as Error).message })
      throw err
    }
  },

  refreshStatus: async () => {
    try {
      const status = await ipcClient.sync.getStatus()
      set({ status })
    } catch {
      // Silently fail status refresh
    }
  },

  resolveConflict: async (id, resolution) => {
    await ipcClient.sync.resolveConflict(id, resolution)
    await get().refreshStatus()
  },

  startAutoSync: async (intervalSeconds) => {
    await ipcClient.sync.autoSyncStart(intervalSeconds)
    set({ autoSyncEnabled: true })
  },

  stopAutoSync: async () => {
    await ipcClient.sync.autoSyncStop()
    set({ autoSyncEnabled: false })
  },

  clearError: () => set({ error: null }),
}))
