export type { SyncResult, SyncStatusInfo, ConflictRecord, AutoSyncConfig, SyncMode } from '../../../../shared/types/sync.types'

export type SyncUIState = 'idle' | 'pulling' | 'pushing' | 'syncing' | 'error'

export interface ConflictDisplayItem {
  id: number
  fullName: string
  program: string
  yearGraduated: number
  changedFields: string[]
}
