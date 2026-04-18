import { create } from 'zustand'
import { ipcClient } from '../data/ipc-client'
import type { DashboardStats, SurveyTableData, WeightedMeanResult, DashboardFilters } from '../../shared/types/analytics.types'

interface AnalyticsState {
  dashboardStats: DashboardStats | null
  surveyTables: Map<string, SurveyTableData>
  weightedMeans: WeightedMeanResult[]
  loading: boolean
  error: string | null
  fetchDashboard: (filters?: DashboardFilters) => Promise<void>
  fetchSurveyData: (column: string, filters?: DashboardFilters) => Promise<SurveyTableData>
  fetchWeightedMeans: (filters?: DashboardFilters) => Promise<void>
  clearError: () => void
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  dashboardStats: null,
  surveyTables: new Map(),
  weightedMeans: [],
  loading: false,
  error: null,

  fetchDashboard: async (filters) => {
    set({ loading: true, error: null })
    try {
      const stats = await ipcClient.analytics.getDashboard(filters)
      set({ dashboardStats: stats, loading: false })
    } catch (err) {
      set({ loading: false, error: (err as Error).message })
    }
  },

  fetchSurveyData: async (column, filters) => {
    const data = await ipcClient.analytics.getSurveyData(column, filters)
    const tables = new Map(get().surveyTables)
    tables.set(column, data)
    set({ surveyTables: tables })
    return data
  },

  fetchWeightedMeans: async (filters) => {
    const means = await ipcClient.analytics.getWeightedMeans(filters)
    set({ weightedMeans: means })
  },

  clearError: () => set({ error: null }),
}))
