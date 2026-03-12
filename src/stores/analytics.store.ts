import { create } from 'zustand'
import { ipcClient } from '../data/ipc-client'
import type { DashboardStats, SurveyTableData, WeightedMeanResult } from '../../shared/types/analytics.types'

interface AnalyticsState {
  dashboardStats: DashboardStats | null
  surveyTables: Map<string, SurveyTableData>
  weightedMeans: WeightedMeanResult[]
  loading: boolean
  error: string | null
  fetchDashboard: (programs?: string[]) => Promise<void>
  fetchSurveyData: (column: string, programs?: string[]) => Promise<SurveyTableData>
  fetchWeightedMeans: (programs?: string[]) => Promise<void>
  clearError: () => void
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  dashboardStats: null,
  surveyTables: new Map(),
  weightedMeans: [],
  loading: false,
  error: null,

  fetchDashboard: async (programs) => {
    set({ loading: true, error: null })
    try {
      const stats = await ipcClient.analytics.getDashboard(programs)
      set({ dashboardStats: stats, loading: false })
    } catch (err) {
      set({ loading: false, error: (err as Error).message })
    }
  },

  fetchSurveyData: async (column, programs) => {
    const data = await ipcClient.analytics.getSurveyData(column, programs)
    const tables = new Map(get().surveyTables)
    tables.set(column, data)
    set({ surveyTables: tables })
    return data
  },

  fetchWeightedMeans: async (programs) => {
    const means = await ipcClient.analytics.getWeightedMeans(programs)
    set({ weightedMeans: means })
  },

  clearError: () => set({ error: null }),
}))
