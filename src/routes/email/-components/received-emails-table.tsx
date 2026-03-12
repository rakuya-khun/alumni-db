import { Loader2, Inbox } from 'lucide-react'
import { formatDateTime } from '../../../lib/formatters'

interface ReceivedEmailsTableProps {
  received: Record<string, unknown>[]
  loading: boolean
}

export function ReceivedEmailsTable({ received, loading }: ReceivedEmailsTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!received || received.length === 0) {
    return (
      <div className="rounded-xl border border-card-border bg-card p-12 text-center">
        <Inbox className="mx-auto h-10 w-10 text-text-secondary" />
        <p className="mt-3 text-text-secondary">No received emails logged yet</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-card-border bg-card shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-card-border bg-surface-secondary">
            <th className="px-6 py-3 text-left font-medium text-text-secondary">From</th>
            <th className="px-6 py-3 text-left font-medium text-text-secondary">Subject</th>
            <th className="px-6 py-3 text-left font-medium text-text-secondary">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-card-border">
          {received.map((entry, i) => (
            <tr key={i} className="hover:bg-surface-secondary transition-colors">
              <td className="px-6 py-3 text-text-primary">{String(entry.from ?? '')}</td>
              <td className="px-6 py-3 text-text-primary">{String(entry.subject ?? '')}</td>
              <td className="px-6 py-3 text-text-secondary">{formatDateTime(String(entry.received_at ?? ''))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
