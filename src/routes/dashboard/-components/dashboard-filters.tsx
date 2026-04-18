import { useState } from 'react'
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react'
import { PROGRAMS, PROGRAM_LABELS } from '../../alumni/-constants'
import { useAuth } from '../../../hooks/use-auth'

export interface DashboardFilterValues {
  programs: string[]
  yearFrom?: number
  yearTo?: number
}

interface DashboardFiltersProps {
  filters: DashboardFilterValues
  onChange: (filters: DashboardFilterValues) => void
}

export function DashboardFilters({ filters, onChange }: DashboardFiltersProps) {
  const { accessiblePrograms } = useAuth()
  const [open, setOpen] = useState(false)

  const visiblePrograms = PROGRAMS.filter((p) => accessiblePrograms.includes(p))

  const toggleProgram = (program: string) => {
    const current = filters.programs
    const next = current.includes(program)
      ? current.filter((p) => p !== program)
      : [...current, program]
    onChange({ ...filters, programs: next })
  }

  const hasActiveFilters =
    filters.programs.length > 0 && filters.programs.length < accessiblePrograms.length ||
    filters.yearFrom != null ||
    filters.yearTo != null

  const clearFilters = () => {
    onChange({ programs: [], yearFrom: undefined, yearTo: undefined })
  }

  return (
    <div className="rounded-xl border border-card-border bg-card shadow-sm">
      {/* Toggle bar */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-6 py-3 text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors rounded-xl"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-text-secondary" />
          <span>Dashboard Filters</span>
          {hasActiveFilters && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
              {(filters.programs.length > 0 && filters.programs.length < accessiblePrograms.length ? 1 : 0)
                + (filters.yearFrom != null ? 1 : 0)
                + (filters.yearTo != null ? 1 : 0)}
            </span>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-text-secondary transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Collapsible filter panel */}
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-card-border px-6 py-4 space-y-4">
          {/* Program toggles */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">Program</label>
            <div className="flex gap-2">
              {visiblePrograms.map((p) => {
                const active = filters.programs.includes(p)
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => toggleProgram(p)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      active
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-card-border text-text-secondary hover:bg-surface-secondary'
                    }`}
                  >
                    {PROGRAM_LABELS[p] ?? p}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Year range */}
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">Year From</label>
              <input
                type="number"
                min={2018}
                value={filters.yearFrom ?? ''}
                onChange={(e) => onChange({ ...filters, yearFrom: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="2018"
                className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary placeholder:text-text-muted"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">Year To</label>
              <input
                type="number"
                min={2018}
                value={filters.yearTo ?? ''}
                onChange={(e) => onChange({ ...filters, yearTo: e.target.value ? Number(e.target.value) : undefined })}
                placeholder={String(new Date().getFullYear())}
                className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary placeholder:text-text-muted"
              />
            </div>
          </div>

          {/* Clear button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <X className="h-3.5 w-3.5" />
              Clear all filters
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
