import { getDb } from './db-manager'

export interface EmailHistoryRow {
  id: number
  subject: string
  body: string
  recipients: string
  recipient_count: number
  status: string
  error_message: string | null
  sent_at: string
}

function toRows(result: { columns: string[]; values: unknown[][] }[]): EmailHistoryRow[] {
  if (result.length === 0) return []
  const { columns, values } = result[0]
  return values.map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return obj as EmailHistoryRow
  })
}

export const emailHistoryRepository = {
  create(record: {
    subject: string
    body: string
    recipients: string
    recipientCount: number
    status?: string
  }): number {
    const db = getDb()
    db.run(
      `INSERT INTO email_history (subject, body, recipients, recipient_count, status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        record.subject,
        record.body,
        record.recipients,
        record.recipientCount,
        record.status ?? 'pending'
      ]
    )
    const result = db.exec('SELECT last_insert_rowid() as id')
    return Number(result[0].values[0][0])
  },

  getAll(): EmailHistoryRow[] {
    const db = getDb()
    const result = db.exec('SELECT * FROM email_history ORDER BY sent_at DESC')
    return toRows(result)
  },

  getById(id: number): EmailHistoryRow | null {
    const db = getDb()
    const result = db.exec('SELECT * FROM email_history WHERE id = ?', [id])
    const rows = toRows(result)
    return rows[0] ?? null
  },

  updateStatus(id: number, status: string, errorMessage?: string): void {
    const db = getDb()
    if (errorMessage) {
      db.run(
        'UPDATE email_history SET status = ?, error_message = ? WHERE id = ?',
        [status, errorMessage, id]
      )
    } else {
      db.run('UPDATE email_history SET status = ? WHERE id = ?', [status, id])
    }
  },

  getCount(): number {
    const db = getDb()
    const result = db.exec('SELECT COUNT(*) FROM email_history')
    if (result.length === 0) return 0
    return Number(result[0].values[0][0])
  }
}
