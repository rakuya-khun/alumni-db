export type { AlumniProfile, HistoryEntry, FieldDiff, AlumniSnapshot } from '../../../../shared/types/profiling.types'

export type DisplayMode = 'history' | 'latest' | 'timeline'

export interface TimelineEntry {
  id: number
  date: string
  changedFields: string[]
  summary: string
}
