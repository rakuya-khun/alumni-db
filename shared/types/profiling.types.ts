import type { Alumni } from './alumni.types'

export interface AlumniProfile extends Alumni {
  historyCount: number
}

export interface HistoryEntry {
  id: number
  alumniId: number
  snapshot: Record<string, unknown>
  changedFields: string[]
  createdAt: string
}

export interface FieldDiff {
  field: string
  label: string
  before: unknown
  after: unknown
}

export interface AlumniSnapshot {
  data: Record<string, unknown>
  timestamp: string
}
