import { getDb } from './db-manager'

export const settingsRepository = {
  get(key: string): string | null {
    const db = getDb()
    const result = db.exec('SELECT value FROM settings WHERE key = ?', [key])
    if (result.length === 0 || result[0].values.length === 0) return null
    return result[0].values[0][0] as string | null
  },

  set(key: string, value: string | null): void {
    const db = getDb()
    db.run(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [key, value]
    )
  },

  getAll(): Record<string, string | null> {
    const db = getDb()
    const result = db.exec('SELECT key, value FROM settings')
    const settings: Record<string, string | null> = {}
    if (result.length === 0) return settings
    for (const row of result[0].values) {
      settings[row[0] as string] = row[1] as string | null
    }
    return settings
  },

  getMultiple(keys: string[]): Record<string, string | null> {
    const db = getDb()
    if (keys.length === 0) return {}
    const placeholders = keys.map(() => '?').join(', ')
    const result = db.exec(
      `SELECT key, value FROM settings WHERE key IN (${placeholders})`,
      keys
    )
    const settings: Record<string, string | null> = {}
    // Initialize all requested keys as null
    for (const key of keys) {
      settings[key] = null
    }
    if (result.length > 0) {
      for (const row of result[0].values) {
        settings[row[0] as string] = row[1] as string | null
      }
    }
    return settings
  },

  delete(key: string): void {
    const db = getDb()
    db.run('DELETE FROM settings WHERE key = ?', [key])
  }
}
