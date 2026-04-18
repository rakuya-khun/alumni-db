import type { ExportFilterData } from '../-schemas/export-filter.schema'
import { PAPER_SIZES, PAPER_SIZE_LABELS } from '../-schemas/export-filter.schema'
import {
  PROGRAMS, PROGRAM_LABELS, EMPLOYMENT_STATUSES, JOB_RELEVANCE_OPTIONS,
  WORK_REGIONS, INDUSTRY_SECTORS_CE, INDUSTRY_SECTORS_CPE, INDUSTRY_SECTORS_EE,
  JOB_LEVEL_CE, JOB_LEVEL_CPE, JOB_LEVEL_EE,
} from '../../alumni/-constants'
import { MultiSelectDropdown } from '../../../components/shared/multi-select-dropdown'

interface ExportFilterFormProps {
  filters: ExportFilterData
  onUpdate: (patch: Partial<ExportFilterData>) => void
  onReset: () => void
  accessiblePrograms: string[]
}

/** Merge all unique values from program-specific arrays */
function mergeOptions(...arrays: (readonly string[])[]): string[] {
  return [...new Set(arrays.flat())]
}

export function ExportFilterForm({ filters, onUpdate, onReset, accessiblePrograms }: ExportFilterFormProps) {
  const visiblePrograms = PROGRAMS.filter((p) => accessiblePrograms.includes(p))

  const allIndustrySectors = mergeOptions(
    ...(visiblePrograms.includes('BSCE') ? [INDUSTRY_SECTORS_CE] : []),
    ...(visiblePrograms.includes('BSCpE') ? [INDUSTRY_SECTORS_CPE] : []),
    ...(visiblePrograms.includes('BSEE') ? [INDUSTRY_SECTORS_EE] : []),
  )

  const allJobLevels = mergeOptions(
    ...(visiblePrograms.includes('BSCE') ? [JOB_LEVEL_CE] : []),
    ...(visiblePrograms.includes('BSCpE') ? [JOB_LEVEL_CPE] : []),
    ...(visiblePrograms.includes('BSEE') ? [JOB_LEVEL_EE] : []),
  )

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
        {/* Programs */}
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

        {/* Year Range */}
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

        {/* Board Passer + Employment dropdowns */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">Board Passer</label>
            <select
              value={filters.hasLicense ?? ''}
              onChange={(e) => onUpdate({ hasLicense: e.target.value ? Number(e.target.value) : undefined })}
              className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary"
            >
              <option value="">All</option>
              <option value="1">Licensed</option>
              <option value="0">Not Licensed</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">Employment</label>
            <select
              value={filters.isEmployed ?? ''}
              onChange={(e) => onUpdate({ isEmployed: e.target.value ? Number(e.target.value) : undefined })}
              className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary"
            >
              <option value="">All</option>
              <option value="1">Employed</option>
              <option value="0">Not Employed</option>
            </select>
          </div>
        </div>

        {/* Multi-select filters */}
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Advanced Filters</label>
          <div className="flex flex-wrap gap-2">
            <MultiSelectDropdown
              label="Job Relevance"
              selected={filters.jobRelevance ?? []}
              options={[...JOB_RELEVANCE_OPTIONS]}
              onChange={(v) => onUpdate({ jobRelevance: v.length > 0 ? v : undefined })}
            />
            <MultiSelectDropdown
              label="Job Level"
              selected={filters.jobLevel ?? []}
              options={allJobLevels}
              onChange={(v) => onUpdate({ jobLevel: v.length > 0 ? v : undefined })}
            />
            <MultiSelectDropdown
              label="Employment Status"
              selected={filters.employmentStatus ?? []}
              options={[...EMPLOYMENT_STATUSES]}
              onChange={(v) => onUpdate({ employmentStatus: v.length > 0 ? v : undefined })}
            />
            <MultiSelectDropdown
              label="Work Region"
              selected={filters.workRegion ?? []}
              options={[...WORK_REGIONS]}
              onChange={(v) => onUpdate({ workRegion: v.length > 0 ? v : undefined })}
            />
            <MultiSelectDropdown
              label="Industry Sector"
              selected={filters.industrySector ?? []}
              options={allIndustrySectors}
              onChange={(v) => onUpdate({ industrySector: v.length > 0 ? v : undefined })}
            />
          </div>
        </div>

        {/* Search */}
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

        {/* Paper Size */}
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
