import { IPC_CHANNELS } from '../../shared/ipc-channels'
import type { Alumni, AlumniFilters } from '../../shared/types/alumni.types'
import type { AccountEntry } from '../../shared/types/auth.types'
import type { DashboardStats, SurveyTableData, WeightedMeanResult, DashboardFilters } from '../../shared/types/analytics.types'
import type { HistoryEntry, AlumniSnapshot } from '../../shared/types/profiling.types'
import type { SyncResult, SyncStatusInfo } from '../../shared/types/sync.types'

interface IpcResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

async function invoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  const result = await window.electronAPI.invoke(channel, ...args) as IpcResponse<T>
  if (!result.success) {
    throw new Error(result.error ?? 'Unknown error')
  }
  return result.data as T
}

export const ipcClient = {
  auth: {
    login: (username: string, password: string) =>
      invoke<{ session: { username: string; role: string; fullName: string; accessiblePrograms: string[] }; isOffline: boolean }>(
        IPC_CHANNELS.AUTH.LOGIN, { username, password }
      ),
    logout: () => invoke<void>(IPC_CHANNELS.AUTH.LOGOUT),
    getSession: () => invoke<{ username: string; role: string; fullName: string; accessiblePrograms: string[] } | null>(IPC_CHANNELS.AUTH.GET_SESSION),
    getAccounts: () => invoke<AccountEntry[]>(IPC_CHANNELS.AUTH.GET_ACCOUNTS),
    createAccount: (data: Record<string, unknown>) => invoke<void>(IPC_CHANNELS.AUTH.CREATE_ACCOUNT, data),
    updateAccount: (data: Record<string, unknown>) => invoke<void>(IPC_CHANNELS.AUTH.UPDATE_ACCOUNT, data),
  },
  alumni: {
    getAll: (filters?: AlumniFilters) => invoke<Alumni[]>(IPC_CHANNELS.ALUMNI.GET_ALL, filters),
    getById: (id: number) => invoke<Alumni>(IPC_CHANNELS.ALUMNI.GET_BY_ID, id),
    create: (data: Record<string, unknown>) => invoke<number>(IPC_CHANNELS.ALUMNI.CREATE, data),
    update: (id: number, data: Record<string, unknown>) => invoke<void>(IPC_CHANNELS.ALUMNI.UPDATE, id, data),
    delete: (id: number) => invoke<void>(IPC_CHANNELS.ALUMNI.DELETE, id),
    search: (query: string, programs?: string[]) => invoke<Alumni[]>(IPC_CHANNELS.ALUMNI.SEARCH, query, programs),
    getSpecializations: () => invoke<string[]>(IPC_CHANNELS.ALUMNI.GET_SPECIALIZATIONS),
    getWorkRegions: () => invoke<string[]>(IPC_CHANNELS.ALUMNI.GET_WORK_REGIONS),
    getEmploymentPositions: () => invoke<string[]>(IPC_CHANNELS.ALUMNI.GET_EMPLOYMENT_POSITIONS),
  },
  analytics: {
    getDashboard: (filters?: DashboardFilters) => invoke<DashboardStats>(IPC_CHANNELS.ANALYTICS.GET_DASHBOARD, filters),
    getSurveyData: (column: string, filters?: DashboardFilters) => invoke<SurveyTableData>(IPC_CHANNELS.ANALYTICS.GET_SURVEY_DATA, column, filters),
    getWeightedMeans: (filters?: DashboardFilters) => invoke<WeightedMeanResult[]>(IPC_CHANNELS.ANALYTICS.GET_WEIGHTED_MEANS, filters),
  },
  profiling: {
    getProfile: (id: number) => invoke<Alumni>(IPC_CHANNELS.PROFILING.GET_PROFILE, id),
    getHistory: (alumniId: number) => invoke<HistoryEntry[]>(IPC_CHANNELS.PROFILING.GET_HISTORY, alumniId),
    getSnapshot: (alumniId: number) => invoke<AlumniSnapshot>(IPC_CHANNELS.PROFILING.GET_SNAPSHOT, alumniId),
  },
  export: {
    pdf: (filters?: AlumniFilters) => invoke<string>(IPC_CHANNELS.EXPORT.PDF, filters),
    docx: (filters?: AlumniFilters) => invoke<string>(IPC_CHANNELS.EXPORT.DOCX, filters),
    excel: (filters?: AlumniFilters) => invoke<string>(IPC_CHANNELS.EXPORT.EXCEL, filters),
    dashboardPdf: (filters?: DashboardFilters) => invoke<string>(IPC_CHANNELS.EXPORT.DASHBOARD_PDF, filters),
    dashboardDocx: (filters?: DashboardFilters) => invoke<string>(IPC_CHANNELS.EXPORT.DASHBOARD_DOCX, filters),
  },
  email: {
    send: (payload: { subject: string; body: string; recipientFilters: AlumniFilters; includeGformLink: boolean }) =>
      invoke<{ sent: number; failed: number; errors: string[] }>(IPC_CHANNELS.EMAIL.SEND, payload),
    getHistory: () => invoke<Record<string, unknown>[]>(IPC_CHANNELS.EMAIL.GET_HISTORY),
    getReceived: () => invoke<Record<string, unknown>[]>(IPC_CHANNELS.EMAIL.GET_RECEIVED),
    testConnection: () => invoke<void>(IPC_CHANNELS.EMAIL.TEST_CONNECTION),
  },
  sync: {
    pull: () => invoke<SyncResult>(IPC_CHANNELS.SYNC.PULL),
    push: () => invoke<SyncResult>(IPC_CHANNELS.SYNC.PUSH),
    full: () => invoke<SyncResult>(IPC_CHANNELS.SYNC.FULL),
    getStatus: () => invoke<SyncStatusInfo>(IPC_CHANNELS.SYNC.GET_STATUS),
    resolveConflict: (id: number, resolution: 'local' | 'remote') =>
      invoke<void>(IPC_CHANNELS.SYNC.RESOLVE_CONFLICT, id, resolution),
    autoSyncStart: (intervalSeconds?: number) => invoke<void>(IPC_CHANNELS.SYNC.AUTO_SYNC_START, intervalSeconds),
    autoSyncStop: () => invoke<void>(IPC_CHANNELS.SYNC.AUTO_SYNC_STOP),
  },
  settings: {
    get: () => invoke<Record<string, string | null>>(IPC_CHANNELS.SETTINGS.GET),
    save: (settings: Record<string, string>) => invoke<void>(IPC_CHANNELS.SETTINGS.SAVE, settings),
    testSmtp: () => invoke<void>(IPC_CHANNELS.SETTINGS.TEST_SMTP),
    testSheets: () => invoke<void>(IPC_CHANNELS.SETTINGS.TEST_SHEETS),
  },
  system: {
    getVersion: () => invoke<string>(IPC_CHANNELS.SYSTEM.GET_VERSION),
    getInfo: () => invoke<Record<string, string>>(IPC_CHANNELS.SYSTEM.GET_INFO),
  },
}
