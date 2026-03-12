import type { ExportFilterData } from '../-schemas/export-filter.schema'
import { PAPER_SIZES, PAPER_SIZE_LABELS, type PaperSize } from '../-schemas/export-filter.schema'
import { PROGRAMS, PROGRAM_LABELS } from '../../alumni/-constants'

interface ExportFilterFormProps {
  filters: ExportFilterData
  onUpdate: (patch: Partial<ExportFilterData>) => void
  onReset: () => void
  accessiblePrograms: string[]
}

export function ExportFilterForm({ filters, onUpdate, onReset, accessiblePrograms }: ExportFilterFormProps) {
  const visiblePrograms = PROGRAMS.filter((p) => accessiblePrograms.includes(p))

  const toggleProgram = (program: string) => {
    const current = filters.programs ?? []
    const next = current.includes(program)
      ? current.filter((p) => p !== program)
      : [...current, program]
    onUpdate({ programs: next.length > 0 ? next : undefined })
  }

  return (
    <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-text-primary">Filter Criteria</h2>
        <button
          type="button"
          onClick={onReset}
          className="text-sm text-primary hover:underline"
        >
          Reset Filters
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Programs</label>
          <div className="flex gap-2">
            {visiblePrograms.map((p) => {
              const active = filters.programs?.includes(p)
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">Year From</label>
            <input
              type="number"
              min={2018}
              value={filters.yearFrom ?? ''}
              onChange={(e) => onUpdate({ yearFrom: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="2018"
              className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary placeholder:text-text-muted"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">Year To</label>
            <input
              type="number"
              min={2018}
              value={filters.yearTo ?? ''}
              onChange={(e) => onUpdate({ yearTo: e.target.value ? Number(e.target.value) : undefined })}
              placeholder={String(new Date().getFullYear())}
              className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary placeholder:text-text-muted"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Search</label>
          <input
            type="text"
            value={filters.search ?? ''}
            onChange={(e) => onUpdate({ search: e.target.value || undefined })}
            placeholder="Search by name, email, or location..."
            className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary placeholder:text-text-muted"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Paper Size (PDF & Word)</label>
          <div className="flex gap-2">
            {PAPER_SIZES.map((size) => {
              const active = (filters.paperSize ?? 'a4') === size
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => onUpdate({ paperSize: size })}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-card-border text-text-secondary hover:bg-surface-secondary'
                  }`}
                >
                  {PAPER_SIZE_LABELS[size]}
                </button>
              )
            })}
          </div>
          <p className="mt-1 text-xs text-text-muted">All exports use landscape orientation</p>
        </div>
      </div>
    </div>
  )
}
