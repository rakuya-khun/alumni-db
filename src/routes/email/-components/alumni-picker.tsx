import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X, User } from 'lucide-react'
import { ipcClient } from '../../../data/ipc-client'
import { useAuth } from '../../../hooks/use-auth'
import type { Alumni } from '../../../../shared/types/alumni.types'

interface AlumniPickerProps {
  selected: Alumni | null
  onSelect: (alumni: Alumni | null) => void
}

export function AlumniPicker({ selected, onSelect }: AlumniPickerProps) {
  const { accessiblePrograms } = useAuth()
  const [alumni, setAlumni] = useState<Alumni[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const all = await ipcClient.alumni.getAll({ programs: accessiblePrograms })
        if (!cancelled) setAlumni(all.filter((a) => a.gmail_address))
      } catch {
        if (!cancelled) setAlumni([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [accessiblePrograms])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return alumni
      .filter((a) => {
        const email = (a.gmail_address || '').toLowerCase()
        return (
          a.full_name.toLowerCase().includes(q) ||
          email.includes(q) ||
          a.program.toLowerCase().includes(q) ||
          String(a.year_graduated).includes(q)
        )
      })
      .slice(0, 20)
  }, [alumni, query])

  const handlePick = (a: Alumni) => {
    onSelect(a)
    setQuery('')
    setFocused(false)
  }

  if (selected) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-primary bg-primary/5 p-4">
        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          <User className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-text-primary truncate">{selected.full_name}</div>
          <div className="text-xs text-text-secondary truncate">
            {selected.program} · Class of {selected.year_graduated}
          </div>
          <div className="text-xs text-text-secondary truncate">{selected.gmail_address}</div>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="inline-flex items-center gap-1.5 rounded-md border border-card-border bg-surface-primary px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-surface-secondary flex-shrink-0"
        >
          <X className="h-3.5 w-3.5" />
          Change
        </button>
      </div>
    )
  }

  const showDropdown = focused && query.trim().length >= 1

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={loading ? 'Loading alumni...' : 'Search alumni by name, email, program, or year...'}
          disabled={loading}
          className="h-10 w-full rounded-lg border border-card-border bg-surface-primary pl-10 pr-4 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
        />
      </div>

      {showDropdown && (
        <div className="absolute z-10 mt-1 w-full max-h-72 overflow-auto rounded-lg border border-card-border bg-card shadow-lg">
          {matches.length === 0 ? (
            <div className="px-4 py-3 text-sm text-text-secondary">No alumni found.</div>
          ) : (
            matches.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => handlePick(a)}
                className="flex flex-col gap-0.5 px-4 py-2.5 cursor-pointer hover:bg-surface-secondary text-left w-full"
              >
                <span className="text-sm font-medium text-text-primary">{a.full_name}</span>
                <span className="text-xs text-text-secondary">
                  {a.program} · Class of {a.year_graduated} · {a.gmail_address}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
