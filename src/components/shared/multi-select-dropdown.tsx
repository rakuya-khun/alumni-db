import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface MultiSelectDropdownProps {
  label: string
  selected: string[]
  options: string[]
  onChange: (values: string[]) => void
}

export function MultiSelectDropdown({ label, selected, options, onChange }: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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
        className={`inline-flex h-10 items-center gap-1.5 rounded-lg border px-4 text-sm font-medium transition-colors ${
          selected.length > 0
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-card-border bg-surface-primary text-text-primary hover:bg-surface-secondary'
        }`}
        type="button"
        onClick={() => setOpen(!open)}
      >
        {label}
        {selected.length > 0 && (
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
            {selected.length}
          </span>
        )}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 z-20 mt-1 max-h-56 w-64 overflow-y-auto rounded-lg border border-card-border bg-card p-2 shadow-lg">
          {options.length === 0 ? (
            <p className="px-2 py-1.5 text-sm text-text-muted">No options available</p>
          ) : (
            options.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-text-primary hover:bg-surface-secondary"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggle(option)}
                  className="h-4 w-4 rounded border-card-border text-primary focus:ring-primary"
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
