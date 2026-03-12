import { useState, useRef, useEffect } from 'react'
import { Search, X, ChevronDown } from 'lucide-react'
import { PROGRAMS, PROGRAM_LABELS } from '../-constants'

interface AlumniTableToolbarProps {
  searchInput: string
  onSearchChange: (value: string) => void
  programs: string[]
  onProgramsChange: (programs: string[]) => void
  syncStatus: string | undefined
  onSyncStatusChange: (status: string | undefined) => void
  isEmployed: number | undefined
  onIsEmployedChange: (value: number | undefined) => void
  hasLicense: number | undefined
  onHasLicenseChange: (value: number | undefined) => void
  specialization: string[]
  setSpecialization: (values: string[]) => void
  specializationOptions: string[]
  workRegion: string[]
  setWorkRegion: (values: string[]) => void
  workRegionOptions: string[]
  employmentPosition: string[]
  setEmploymentPosition: (values: string[]) => void
  employmentPositionOptions: string[]
  hasActiveFilters: boolean
  onClearFilters: () => void
}

/** A multi-select dropdown with checkbox list */
function MultiSelectDropdown({
  label,
  selected,
  options,
  onChange,
}: {
  label: string
  selected: string[]
  options: string[]
  onChange: (values: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((v) => v !== option))
    } else {
      onChange([...selected, option])
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors ${
          selected.length > 0
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-card-border bg-surface-primary text-text-primary hover:bg-surface-secondary'
        }`}
        type="button"
        onClick={() => setOpen(!open)}
      >
        {label}
        {selected.length > 0 && (
          <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {selected.length}
          </span>
        )}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 z-20 mt-1 max-h-56 w-56 overflow-y-auto rounded-lg border border-card-border bg-card p-2 shadow-lg">
          {options.length === 0 ? (
            <p className="px-2 py-1.5 text-xs text-text-muted">No options available</p>
          ) : (
            options.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs text-text-primary hover:bg-surface-secondary"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggle(option)}
                  className="h-3.5 w-3.5 rounded border-card-border text-primary focus:ring-primary"
                />
                <span className="truncate">{option}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export function AlumniTableToolbar({
  searchInput,
  onSearchChange,
  programs,
  onProgramsChange,
  syncStatus,
  onSyncStatusChange,
  isEmployed,
  onIsEmployedChange,
  hasLicense,
  onHasLicenseChange,
  specialization,
  setSpecialization,
  specializationOptions,
  workRegion,
  setWorkRegion,
  workRegionOptions,
  employmentPosition,
  setEmploymentPosition,
  employmentPositionOptions,
  hasActiveFilters,
  onClearFilters,
}: AlumniTableToolbarProps) {
  const toggleProgram = (prog: string) => {
    if (programs.includes(prog)) {
      onProgramsChange(programs.filter((p) => p !== prog))
    } else {
      onProgramsChange([...programs, prog])
    }
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search by name, email, or address..."
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 w-full rounded-lg border border-card-border bg-surface-primary pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Program toggles */}
        <div className="flex gap-1">
          {PROGRAMS.map((prog) => (
            <button
              key={prog}
              onClick={() => toggleProgram(prog)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                programs.includes(prog)
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-card-border bg-surface-primary text-text-secondary hover:bg-surface-secondary'
              }`}
            >
              {PROGRAM_LABELS[prog] ?? prog}
            </button>
          ))}
        </div>

        {/* Sync status */}
        <select
          value={syncStatus ?? ''}
          onChange={(e) => onSyncStatusChange(e.target.value || undefined)}
          className="h-8 rounded-lg border border-card-border bg-surface-primary px-3 text-xs text-text-primary focus:border-primary focus:outline-none"
        >
          <option value="">All Sync</option>
          <option value="synced">Synced</option>
          <option value="pending">Pending</option>
          <option value="conflict">Conflict</option>
        </select>

        {/* Employment */}
        <select
          value={isEmployed != null ? String(isEmployed) : ''}
          onChange={(e) => onIsEmployedChange(e.target.value ? Number(e.target.value) : undefined)}
          className="h-8 rounded-lg border border-card-border bg-surface-primary px-3 text-xs text-text-primary focus:border-primary focus:outline-none"
        >
          <option value="">All Employment</option>
          <option value="1">Employed</option>
          <option value="0">Not Employed</option>
        </select>

        {/* Board Passer (maps to has_license column) */}
        <select
          value={hasLicense != null ? String(hasLicense) : ''}
          onChange={(e) => onHasLicenseChange(e.target.value ? Number(e.target.value) : undefined)}
          className="h-8 rounded-lg border border-card-border bg-surface-primary px-3 text-xs text-text-primary focus:border-primary focus:outline-none"
        >
          <option value="">All Board Passer</option>
          <option value="1">Board Passer</option>
          <option value="0">Non-Board Passer</option>
        </select>

        {/* Specialization */}
        <MultiSelectDropdown
          label="Specialization"
          selected={specialization}
          options={specializationOptions}
          onChange={setSpecialization}
        />

        {/* Area/Location */}
        <MultiSelectDropdown
          label="Area/Location"
          selected={workRegion}
          options={workRegionOptions}
          onChange={setWorkRegion}
        />

        {/* Employment Position */}
        <MultiSelectDropdown
          label="Employment Position"
          selected={employmentPosition}
          options={employmentPositionOptions}
          onChange={setEmploymentPosition}
        />

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-error hover:bg-error/10"
          >
            <X className="h-3.5 w-3.5" />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  )
}
