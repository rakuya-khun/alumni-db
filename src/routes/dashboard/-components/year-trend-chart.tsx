import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface YearTrendChartProps {
  data: { year: number; count: number }[]
}

export function YearTrendChart({ data }: YearTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-text-primary">Responses of Graduates Per Year</h3>
        <p className="text-sm text-text-muted">No data available.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-text-primary">Responses of Graduates Per Year</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="rgb(var(--color-accent))"
              strokeWidth={2}
              dot={{ fill: 'rgb(var(--color-accent))', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}