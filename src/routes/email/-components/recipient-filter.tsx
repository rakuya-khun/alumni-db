import { useAuth } from '../../../hooks/use-auth'
import { PROGRAMS, PROGRAM_LABELS } from '../../alumni/-constants'
import { cn } from '../../../lib/cn'
import type { AlumniFilters } from '../../../../shared/types/alumni.types'

interface RecipientFilterProps {
  filters: AlumniFilters
  onUpdate: (partial: Partial<AlumniFilters>) => void
}

export function RecipientFilter({ filters, onUpdate }: RecipientFilterProps) {
  const { accessiblePrograms } = useAuth()
  const availablePrograms = PROGRAMS.filter((p) => accessiblePrograms.includes(p))

  const toggleProgram = (program: string) => {
    const current = filters.programs ?? []
    const next = current.includes(program)
      ? current.filter((p) => p !== program)
      : [...current, program]
    onUpdate({ programs: next.length > 0 ? next : accessiblePrograms })
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-text-primary">Filter Recipients</h3>
      <div className="flex flex-wrap gap-2">
        {availablePrograms.map((program) => (
          <button
            key={program}
            type="button"
            onClick={() => toggleProgram(program)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              (filters.programs ?? []).includes(program)
                ? 'bg-primary text-primary-foreground'
                : 'border border-card-border text-text-secondary hover:bg-surface-secondary'
            )}
          >
            {PROGRAM_LABELS[program]}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <label className="flex items-center gap-2 text-sm text-text-primary">
          Year from
          <input
            type="number"
            min={2018}
            max={new Date().getFullYear()}
            value={filters.yearFrom ?? ''}
            onChange={(e) => onUpdate({ yearFrom: e.target.value ? Number(e.target.value) : undefined })}
            className="h-9 w-24 rounded-lg border border-card-border bg-surface-primary px-3 text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-text-primary">
          to
          <input
            type="number"
            min={2018}
            max={new Date().getFullYear()}
            value={filters.yearTo ?? ''}
            onChange={(e) => onUpdate({ yearTo: e.target.value ? Number(e.target.value) : undefined })}
            className="h-9 w-24 rounded-lg border border-card-border bg-surface-primary px-3 text-sm"
          />
        </label>
      </div>
    </div>
  )
}
