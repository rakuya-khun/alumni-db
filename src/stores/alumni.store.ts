import { create } from 'zustand'
import { ipcClient } from '../data/ipc-client'
import type { Alumni, AlumniFilters } from '../../shared/types/alumni.types'

interface AlumniState {
  list: Alumni[]
  filters: AlumniFilters
  selectedId: number | null
  loading: boolean
  error: string | null
  fetchAll: (filters?: AlumniFilters) => Promise<void>
  create: (data: Record<string, unknown>) => Promise<number>
  update: (id: number, data: Record<string, unknown>) => Promise<void>
  remove: (id: number) => Promise<void>
  search: (query: string, programs?: string[]) => Promise<void>
  setFilters: (filters: AlumniFilters) => void
  setSelectedId: (id: number | null) => void
  clearError: () => void
}

export const useAlumniStore = create<AlumniState>((set, get) => ({
  list: [],
  filters: {},
  selectedId: null,
  loading: false,
  error: null,

  fetchAll: async (filters) => {
    set({ loading: true, error: null })
    try {
      const f = filters ?? get().filters
      const list = await ipcClient.alumni.getAll(f)
      set({ list, loading: false })
    } catch (err) {
      set({ loading: false, error: (err as Error).message })
    }
  },

  create: async (data) => {
    const id = await ipcClient.alumni.create(data)
    await get().fetchAll()
    return id
  },

  update: async (id, data) => {
    await ipcClient.alumni.update(id, data)
    await get().fetchAll()
  },

  remove: async (id) => {
    await ipcClient.alumni.delete(id)
    await get().fetchAll()
  },

  search: async (query, programs) => {
    set({ loading: true, error: null })
    try {
      const list = await ipcClient.alumni.search(query, programs)
      set({ list, loading: false })
    } catch (err) {
      set({ loading: false, error: (err as Error).message })
    }
  },

  setFilters: (filters) => set({ filters }),
  setSelectedId: (id) => set({ selectedId: id }),
  clearError: () => set({ error: null }),
}))
