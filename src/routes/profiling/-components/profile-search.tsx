import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { useAuth } from '../../../hooks/use-auth'
import { ipcClient } from '../../../data/ipc-client'
import type { Alumni } from '../../../../shared/types/alumni.types'
import { useDebounce } from '../../../hooks/use-debounce'

interface ProfileSearchProps {
  onSelect: (alumni: Alumni) => void
}

export function ProfileSearch({ onSelect }: ProfileSearchProps) {
  const { accessiblePrograms } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Alumni[]>([])
  const [loading, setLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([])
      return
    }
    let cancelled = false
    setLoading(true)
    ipcClient.alumni.search(debouncedQuery.trim(), accessiblePrograms)
      .then((data) => { if (!cancelled) setResults(data) })
      .catch(() => { if (!cancelled) setResults([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [debouncedQuery, accessiblePrograms])

  const handleClear = () => {
    setQuery('')
    setResults([])
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search alumni by name..."
          className="h-10 w-full rounded-lg border border-card-border bg-surface-primary pl-10 pr-10 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {debouncedQuery.trim().length >= 2 && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-card-border bg-surface-primary shadow-lg max-h-64 overflow-y-auto">
          {loading && (
            <div className="px-4 py-3 text-sm text-text-secondary">Searching...</div>
          )}
          {!loading && results.length === 0 && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm font-medium text-text-secondary">No alumni found</p>
              <p className="mt-1 text-xs text-text-muted">Try a different name or check the spelling</p>
            </div>
          )}
          {results.map((alumni) => (
            <button
              key={alumni.id}
              type="button"
              onClick={() => { onSelect(alumni); handleClear() }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-surface-secondary transition-colors"
            >
              <div>
                <p className="font-medium text-text-primary">{alumni.full_name}</p>
                <p className="text-text-secondary">{alumni.program} — Class of {alumni.year_graduated}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
