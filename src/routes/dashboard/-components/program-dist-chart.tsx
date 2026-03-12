import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = [
  'rgb(var(--color-chart-1))',
  'rgb(var(--color-chart-2))',
  'rgb(var(--color-chart-3))',
]

interface ProgramDistChartProps {
  data: { program: string; count: number }[]
}

export function ProgramDistChart({ data }: ProgramDistChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-text-primary">Alumni by Program</h3>
        <p className="text-sm text-text-muted">No data available.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-text-primary">Alumni by Program</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="program" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}