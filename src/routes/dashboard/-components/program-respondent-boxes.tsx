import { GraduationCap } from 'lucide-react'
import { formatNumber } from '../../../lib/formatters'

const PROGRAM_LABELS: Record<string, string> = {
  BSCE: 'Civil Engineering',
  BSCpE: 'Computer Engineering',
  BSEE: 'Electrical Engineering',
}

interface ProgramRespondentBoxesProps {
  countByProgram: { program: string; count: number }[]
}

export function ProgramRespondentBoxes({ countByProgram }: ProgramRespondentBoxesProps) {
  return (
    <>
      {countByProgram.map((item) => (
        <div
          key={item.program}
          className="rounded-xl border border-card-border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">
                {PROGRAM_LABELS[item.program] ?? item.program}
              </p>
              <p className="mt-1 text-2xl font-bold text-text-primary">
                {formatNumber(item.count)}
              </p>
              <p className="mt-1 text-xs text-text-muted">{item.program} respondents</p>
            </div>
            <GraduationCap className="h-8 w-8 text-text-muted" />
          </div>
        </div>
      ))}
    </>
  )
}