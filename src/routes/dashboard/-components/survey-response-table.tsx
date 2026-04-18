import { Loader2 } from 'lucide-react'
import type { SurveyTableProps } from '../-types/analytics.types'
import { formatPercentage } from '../../../lib/formatters'

const MAX_VISIBLE_ROWS = 10
const ROW_HEIGHT = 36 // approx height per row in px

export function SurveyResponseTable({ title, data, loading, showWeightedMean, headerSlot, totalLabel }: SurveyTableProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
        </div>
      </div>
    )
  }

  if (!data || !data.rows || data.rows.length === 0) {
    return (
      <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <p className="mt-2 text-sm text-text-muted">No data available.</p>
      </div>
    )
  }

  const totalCount = data.rows.reduce((sum, r) => sum + r.count, 0)
  const needsScroll = data.rows.length > MAX_VISIBLE_ROWS

  return (
    <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mt-1 mb-4 text-xs text-text-muted">{totalLabel ?? 'Total responses'}: {totalCount}</p>

      {headerSlot}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-card-border">
              <th className="px-3 py-2 text-left font-medium text-text-secondary">Response</th>
              <th className="px-3 py-2 text-right font-medium text-text-secondary">Count</th>
              <th className="px-3 py-2 text-right font-medium text-text-secondary">Percentage</th>
            </tr>
          </thead>
        </table>

        <div
          className={needsScroll ? 'dashboard-scroll overflow-y-auto' : ''}
          style={needsScroll ? { maxHeight: MAX_VISIBLE_ROWS * ROW_HEIGHT } : undefined}
        >
          <table className="w-full text-sm">
            <tbody>
              {data.rows.map((row) => (
                <tr key={row.value} className="border-b border-card-border/50 last:border-0">
                  <td className="px-3 py-2 text-text-primary">{row.value}</td>
                  <td className="px-3 py-2 text-right text-text-primary">{row.count}</td>
                  <td className="px-3 py-2 text-right text-text-secondary">
                    {formatPercentage(row.percentage ?? (totalCount > 0 ? (row.count / totalCount) * 100 : 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showWeightedMean && data.weightedMean != null && (
          <table className="w-full text-sm">
            <tfoot>
              <tr className="border-t-2 border-card-border">
                <td className="px-3 py-2 font-semibold text-text-primary">Weighted Mean</td>
                <td colSpan={2} className="px-3 py-2 text-right font-semibold text-primary">
                  {data.weightedMean.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  )
}
