import { X } from 'lucide-react'
import { PROGRAMS, PROGRAM_LABELS } from '../../../alumni/-constants'
import { useAuth } from '../../../../hooks/use-auth'
import type { PeoFilters as PeoFiltersValue, DenominatorMode } from '../../../../../shared/types/peo.types'

interface PeoFiltersProps {
  value: PeoFiltersValue
  onChange: (next: PeoFiltersValue) => void
}

export function PeoFilters({ value, onChange }: PeoFiltersProps) {
  const { accessiblePrograms } = useAuth()
  const visiblePrograms = PROGRAMS.filter((p) => accessiblePrograms.includes(p))

  const programs = value.programs ?? []
  const denomMode: DenominatorMode = value.denominatorMode ?? 'total'

  const toggleProgram = (program: string) => {
    const next = programs.includes(program)
      ? programs.filter((p) => p !== program)
      : [...programs, program]
    onChange({ ...value, programs: next.length > 0 ? next : undefined })
  }

  const isDefault =
    (programs.length === 0 || programs.length === accessiblePrograms.length) &&
    value.yearFrom == null &&
    value.yearTo == null &&
    denomMode === 'total' &&
    value.asOfYear == null

  const clear = () =>
    onChange({
      programs: undefined,
      yearFrom: undefined,
      yearTo: undefined,
      denominatorMode: 'total',
      asOfYear: undefined,
    })

  return (
    <div className="rounded-lg border border-card-border bg-surface-secondary p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-text-primary">PEO Filters</h4>
        {!isDefault && (
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <X className="h-3.5 w-3.5" />
            Clear PEO filters
          </button>
        )}
      </div>

      {/* Program toggles */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-text-secondary">Programs</label>
        <div className="flex flex-wrap gap-2">
          {visiblePrograms.map((p) => {
            const active = programs.includes(p)
            return (
              <button
                key={p}
                type="button"
                onClick={() => toggleProgram(p)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-card-border bg-surface-primary text-text-secondary hover:bg-surface-tertiary'
                }`}
              >
                {PROGRAM_LABELS[p] ?? p}
              </button>
            )
          })}
        </div>
      </div>

      {/* Year range */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Year From</label>
          <input
            type="number"
            min={2018}
            value={value.yearFrom ?? ''}
            onChange={(e) =>
              onChange({ ...value, yearFrom: e.target.value ? Number(e.target.value) : undefined })
            }
            placeholder="2018"
            className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary placeholder:text-text-muted"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Year To</label>
          <input
            type="number"
            min={2018}
            value={value.yearTo ?? ''}
            onChange={(e) =>
              onChange({ ...value, yearTo: e.target.value ? Number(e.target.value) : undefined })
            }
            placeholder={String(new Date().getFullYear())}
            className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary placeholder:text-text-muted"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">As-of Year</label>
          <input
            type="number"
            min={2018}
            value={value.asOfYear ?? ''}
            onChange={(e) =>
              onChange({ ...value, asOfYear: e.target.value ? Number(e.target.value) : undefined })
            }
            placeholder={String(new Date().getFullYear())}
            className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary placeholder:text-text-muted"
          />
        </div>
      </div>

      {/* Denominator mode */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-text-secondary">Denominator</label>
        <div className="inline-flex rounded-lg border border-card-border bg-surface-primary p-1">
          <button
            type="button"
            onClick={() => onChange({ ...value, denominatorMode: 'total' })}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              denomMode === 'total'
                ? 'bg-primary text-primary-foreground'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Total respondents
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...value, denominatorMode: 'employed' })}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              denomMode === 'employed'
                ? 'bg-primary text-primary-foreground'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Employed only
          </button>
        </div>
      </div>
    </div>
  )
}
