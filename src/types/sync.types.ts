export type { SyncStatus, SyncMode, SyncResult, SyncStatusInfo, ConflictRecord, AutoSyncConfig } from '../../shared/types/sync.types'

export type SyncUIOperation = 'idle' | 'pulling' | 'pushing' | 'syncing'
