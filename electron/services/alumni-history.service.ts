import { alumniHistoryRepository, type AlumniHistoryRow } from '../database/alumni-history.repository'

export const alumniHistoryService = {
  getByAlumniId(alumniId: number): AlumniHistoryRow[] {
    return alumniHistoryRepository.getByAlumniId(alumniId)
  },

  getSnapshot(alumniId: number): Record<string, unknown> | null {
    const entry = alumniHistoryRepository.getLatest(alumniId)
    if (!entry) return null
    try {
      return JSON.parse(entry.snapshot)
    } catch {
      return null
    }
  },

  getCount(alumniId: number): number {
    return alumniHistoryRepository.getCount(alumniId)
  },

  /** Parse a history entry into a structured object with changed fields */
  parseEntry(entry: AlumniHistoryRow): {
    snapshot: Record<string, unknown>
    changedFields: string[]
    createdAt: string
  } {
    let snapshot: Record<string, unknown> = {}
    let changedFields: string[] = []
    try {
      snapshot = JSON.parse(entry.snapshot)
    } catch { /* empty */ }
    try {
      changedFields = JSON.parse(entry.changed_fields)
    } catch { /* empty */ }
    return { snapshot, changedFields, createdAt: entry.created_at }
  }
}
