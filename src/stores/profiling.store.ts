import { create } from 'zustand'
import { ipcClient } from '../data/ipc-client'
import type { Alumni } from '../../shared/types/alumni.types'
import type { HistoryEntry, AlumniSnapshot } from '../../shared/types/profiling.types'

type DisplayMode = 'history' | 'latest' | 'timeline'

interface ProfilingState {
  selectedProfile: Alumni | null
  history: HistoryEntry[]
  displayMode: DisplayMode
  profileLoading: boolean
  historyLoading: boolean
  loading: boolean
  error: string | null
  fetchProfile: (id: number) => Promise<void>
  fetchHistory: (alumniId: number) => Promise<void>
  getSnapshot: (historyId: number) => Promise<AlumniSnapshot>
  setDisplayMode: (mode: DisplayMode) => void
  clearProfile: () => void
  clearError: () => void
}

export const useProfilingStore = create<ProfilingState>((set, get) => ({
  selectedProfile: null,
  history: [],
  displayMode: 'history',
  profileLoading: false,
  historyLoading: false,
  loading: false,
  error: null,

  fetchProfile: async (id) => {
    set({ profileLoading: true, loading: true, error: null })
    try {
      const profile = await ipcClient.profiling.getProfile(id)
      const stillHistoryLoading = get().historyLoading
      set({ selectedProfile: profile, profileLoading: false, loading: stillHistoryLoading })
    } catch (err) {
      const stillHistoryLoading = get().historyLoading
      set({ profileLoading: false, loading: stillHistoryLoading, error: (err as Error).message })
    }
  },

  fetchHistory: async (alumniId) => {
    set({ historyLoading: true, loading: true })
    try {
      const history = await ipcClient.profiling.getHistory(alumniId)
      const stillProfileLoading = get().profileLoading
      set({ history, historyLoading: false, loading: stillProfileLoading })
    } catch (err) {
      const stillProfileLoading = get().profileLoading
      set({ historyLoading: false, loading: stillProfileLoading })
    }
  },

  getSnapshot: async (historyId) => {
    return await ipcClient.profiling.getSnapshot(historyId)
  },

  setDisplayMode: (mode) => set({ displayMode: mode }),
  clearProfile: () => set({ selectedProfile: null, history: [], displayMode: 'history', profileLoading: false, historyLoading: false }),
  clearError: () => set({ error: null }),
}))
