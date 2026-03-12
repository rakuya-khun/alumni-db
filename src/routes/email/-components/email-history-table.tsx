import { Loader2, Mail } from 'lucide-react'
import { cn } from '../../../lib/cn'
import { formatDateTime } from '../../../lib/formatters'

interface EmailHistoryTableProps {
  history: Record<string, unknown>[]
  loading: boolean
}

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-success/10 text-success',
  pending: 'bg-warning/10 text-warning',
  failed: 'bg-error/10 text-error',
}

export function EmailHistoryTable({ history, loading }: EmailHistoryTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!history || history.length === 0) {
    return (
      <div className="rounded-xl border border-card-border bg-card p-12 text-center">
        <Mail className="mx-auto h-10 w-10 text-text-secondary" />
        <p className="mt-3 text-text-secondary">No email history found</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-card-border bg-card shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-card-border bg-surface-secondary">
            <th className="px-6 py-3 text-left font-medium text-text-secondary">Subject</th>
            <th className="px-6 py-3 text-left font-medium text-text-secondary">Recipients</th>
            <th className="px-6 py-3 text-left font-medium text-text-secondary">Date</th>
            <th className="px-6 py-3 text-left font-medium text-text-secondary">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-card-border">
          {history.map((entry, i) => (
            <tr key={i} className="hover:bg-surface-secondary transition-colors">
              <td className="px-6 py-3 font-medium text-text-primary">{String(entry.subject ?? '')}</td>
              <td className="px-6 py-3 text-text-secondary">{String(entry.recipient_count ?? '')}</td>
              <td className="px-6 py-3 text-text-secondary">{formatDateTime(String(entry.sent_at ?? entry.created_at ?? ''))}</td>
              <td className="px-6 py-3">
                <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_COLORS[String(entry.status ?? 'pending')])}>
                  {String(entry.status ?? 'pending')}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
