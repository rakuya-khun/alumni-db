import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Customized } from 'recharts'
import type { FrequencyRow } from '../-types/analytics.types'

const COLORS = [
  'rgb(var(--color-chart-1))',
  'rgb(var(--color-chart-2))',
  'rgb(var(--color-chart-3))',
  'rgb(var(--color-chart-4))',
  'rgb(var(--color-chart-5))',
]

interface EmploymentChartProps {
  data: FrequencyRow[] | null
}

const RADIAN = Math.PI / 180
const MIN_LABEL_GAP = 16

interface Sector {
  cx: number
  cy: number
  outerRadius: number
  startAngle: number
  endAngle: number
  name: string
  value: number
  percent: number
}

interface LabelItem {
  name: string
  percent: number
  edgeX: number
  edgeY: number
  naturalY: number
  y: number
  side: 'left' | 'right'
}

function distributeLabels(labels: LabelItem[]): void {
  labels.sort((a, b) => a.naturalY - b.naturalY)
  for (let i = 1; i < labels.length; i++) {
    if (labels[i].y - labels[i - 1].y < MIN_LABEL_GAP) {
      labels[i].y = labels[i - 1].y + MIN_LABEL_GAP
    }
  }
  for (let i = labels.length - 2; i >= 0; i--) {
    if (labels[i + 1].y - labels[i].y < MIN_LABEL_GAP) {
      labels[i].y = labels[i + 1].y - MIN_LABEL_GAP
    }
  }
}

function PieLabels({ formattedGraphicalItems }: { formattedGraphicalItems?: unknown[] }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gItems = formattedGraphicalItems as any[] | undefined
  const sectors: Sector[] | undefined = gItems?.[0]?.props?.sectors
  if (!sectors || sectors.length === 0) return null

  const { cx, cy, outerRadius } = sectors[0]
  const lineColor = 'rgb(var(--color-text-muted))'
  const elbowOffset = outerRadius + 20
  const textOffset = elbowOffset + 8

  const labels: LabelItem[] = sectors.map((s) => {
    const midAngle = (s.startAngle + s.endAngle) / 2
    // Recharts angles: counter-clockwise from 3 o'clock (math convention)
    const rad = midAngle * RADIAN
    const edgeX = cx + outerRadius * Math.cos(rad)
    const edgeY = cy - outerRadius * Math.sin(rad)
    const side: 'left' | 'right' = Math.cos(rad) >= 0 ? 'right' : 'left'

    return {
      name: s.name,
      percent: s.percent,
      edgeX,
      edgeY,
      naturalY: edgeY,
      y: edgeY,
      side,
    }
  })

  const left = labels.filter((l) => l.side === 'left')
  const right = labels.filter((l) => l.side === 'right')
  distributeLabels(left)
  distributeLabels(right)

  return (
    <g>
      {labels.map((l, i) => {
        const sign = l.side === 'right' ? 1 : -1
        const elbowX = cx + sign * elbowOffset
        const textX = cx + sign * textOffset

        return (
          <g key={i}>
            <polyline
              points={`${l.edgeX},${l.edgeY} ${elbowX},${l.y} ${textX},${l.y}`}
              fill="none"
              stroke={lineColor}
              strokeWidth={1}
            />
            <text
              x={textX + sign * 2}
              y={l.y}
              textAnchor={l.side === 'right' ? 'start' : 'end'}
              dominantBaseline="central"
              fontSize={11}
              fill="currentColor"
              className="text-text-primary"
            >
              {`${l.name} (${(l.percent * 100).toFixed(0)}%)`}
            </text>
          </g>
        )
      })}
    </g>
  )
}

export function EmploymentChart({ data }: EmploymentChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-text-primary">Employment Status</h3>
        <p className="text-sm text-text-muted">No data available.</p>
      </div>
    )
  }

  const chartData = data.map((row) => ({ name: row.value, value: row.count }))
  const total = chartData.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Employment Status</h3>
        <span className="text-sm text-text-muted">Total = {total}</span>
      </div>
      {/* overflow-visible prevents SVG from clipping labels that extend beyond the pie */}
      <div className="h-80 [&_svg]:overflow-visible">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 10, right: 140, bottom: 10, left: 140 }}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={false}
              labelLine={false}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Customized component={PieLabels} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}