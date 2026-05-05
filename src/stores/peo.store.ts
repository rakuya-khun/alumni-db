import { create } from 'zustand'
import { ipcClient } from '../data/ipc-client'
import type { PeoFilters, PeoResult, PeoOutcomeRates } from '../../shared/types/peo.types'

export type PeoTab = 'peo1' | 'peo2' | 'peo3' | 'outcomes'

interface PeoState {
  result: PeoResult | null
  outcomes: PeoOutcomeRates | null
  loading: boolean
  outcomesLoading: boolean
  error: string | null
  accordionOpen: boolean
  selectedTab: PeoTab
  fetch: (filters?: PeoFilters) => Promise<void>
  setAccordionOpen: (open: boolean) => void
  setSelectedTab: (tab: PeoTab) => void
  openWithTab: (tab: PeoTab) => void
  clearError: () => void
}

export const usePeoStore = create<PeoState>((set) => ({
  result: null,
  outcomes: null,
  loading: false,
  outcomesLoading: false,
  error: null,
  accordionOpen: false,
  selectedTab: 'peo1',

  fetch: async (filters) => {
    set({ loading: true, outcomesLoading: true, error: null })
    try {
      const [result, outcomes] = await Promise.all([
        ipcClient.peo.compute(filters),
        ipcClient.peo.getOutcomeRates(filters),
      ])
      set({ result, outcomes, loading: false, outcomesLoading: false })
    } catch (err) {
      set({
        loading: false,
        outcomesLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load PEO data',
      })
    }
  },

  setAccordionOpen: (open) => set({ accordionOpen: open }),
  setSelectedTab: (tab) => set({ selectedTab: tab }),
  openWithTab: (tab) => set({ accordionOpen: true, selectedTab: tab }),
  clearError: () => set({ error: null }),
}))
