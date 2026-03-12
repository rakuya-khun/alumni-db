import { Loader2 } from 'lucide-react'
import type { WeightedMeanResult, SurveyTableData } from '../-types/analytics.types'

const COMPETENCY_LABELS: Record<string, string> = {
  comp_engineering_knowledge: 'Engineering Knowledge',
  comp_problem_solving: 'Problem-Solving Ability',
  comp_engineering_design: 'Engineering Design',
  comp_communication: 'Communication Skills',
  comp_teamwork: 'Teamwork & Collaboration',
  comp_ethics: 'Ethics & Responsibility',
  comp_leadership: 'Leadership & Initiative',
  comp_lifelong_learning: 'Lifelong Learning',
  comp_modern_tools: 'Modern Tools & Technology',
}

const SCALE_LABELS = ['1 (Very Poor)', '2 (Poor)', '3 (Fair)', '4 (Good)', '5 (Excellent)']

interface CompetenciesTableProps {
  data: SurveyTableData | null
  weightedMeans: WeightedMeanResult[]
  loading?: boolean
}

export function CompetenciesTable({ data, weightedMeans, loading }: CompetenciesTableProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-text-primary">Competencies Assessment</h3>
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
        </div>
      </div>
    )
  }

  if (!data || !data.rows || data.rows.length === 0) {
    return (
      <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-text-primary">Competencies Assessment</h3>
        <p className="text-sm text-text-muted">No data available.</p>
      </div>
    )
  }

  const safeMeans = weightedMeans ?? []
  const meanMap = new Map(safeMeans.map((m) => [m.competency, m.mean]))

  return (
    <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-text-primary">Competencies Assessment</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-card-border">
              <th className="px-3 py-2 text-left font-medium text-text-secondary">Competency</th>
              {SCALE_LABELS.map((label) => (
                <th key={label} className="px-3 py-2 text-center font-medium text-text-secondary">
                  {label}
                </th>
              ))}
              <th className="px-3 py-2 text-center font-medium text-text-secondary">WM</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(COMPETENCY_LABELS).map(([col, label]) => {
              const mean = meanMap.get(col)
              const rows = data.rows.filter((r) => r.value.startsWith(col + ':'))
              const scaleFreq = [1, 2, 3, 4, 5].map((scale) => {
                const row = rows.find((r) => r.value === `${col}:${scale}`)
                return row?.count ?? 0
              })

              return (
                <tr key={col} className="border-b border-card-border/50 last:border-0">
                  <td className="px-3 py-2 text-text-primary">{label}</td>
                  {scaleFreq.map((freq, i) => (
                    <td key={i} className="px-3 py-2 text-center text-text-primary">
                      {freq}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center font-semibold text-primary">
                    {mean != null ? mean.toFixed(2) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}