export type SyncStatus = 'pending' | 'synced' | 'conflict'

export type SyncMode = 'pull' | 'push' | 'full'

export interface SyncResult {
  pulled: number
  pushed: number
  conflicts: number
}

export interface SyncStatusInfo {
  pendingCount: number
  conflictCount: number
  isOnline: boolean
  lastSyncAt: string | null
}

export interface ConflictRecord {
  id: number
  fullName: string
  program: string
  yearGraduated: number
  localData: Record<string, unknown>
  remoteData?: Record<string, unknown>
}

export interface AutoSyncConfig {
  enabled: boolean
  intervalMinutes: number
}
