import { Users } from 'lucide-react'
import { formatNumber } from '../../../lib/formatters'

interface TotalResponsesCardProps {
  total: number
}

export function TotalResponsesCard({ total }: TotalResponsesCardProps) {
  return (
    <div className="rounded-xl bg-primary p-6 text-primary-foreground shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-85">Total Responses</p>
          <p className="mt-1 text-3xl font-bold">{formatNumber(total)}</p>
          <p className="mt-1 text-xs opacity-70">Alumni survey records</p>
        </div>
        <Users className="h-10 w-10 opacity-75" />
      </div>
    </div>
  )
}
