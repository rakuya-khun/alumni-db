import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Loader2 } from 'lucide-react'
import { ProfileSearch } from './-components/profile-search'
import { useAuth } from '../../hooks/use-auth'
import { ipcClient } from '../../data/ipc-client'
import { PROGRAM_LABELS } from '../alumni/-constants'
import type { Alumni } from '../../../shared/types/alumni.types'

export default function ProfilingListPage() {
  const navigate = useNavigate()
  const { accessiblePrograms } = useAuth()
  const [alumni, setAlumni] = useState<Alumni[]>([])
  const [loading, setLoading] = useState(true)

  const loadAlumni = useCallback(async () => {
    setLoading(true)
    try {
      const data = await ipcClient.alumni.getAll({ programs: accessiblePrograms })
      setAlumni(data)
    } catch {
      setAlumni([])
    } finally {
      setLoading(false)
    }
  }, [accessiblePrograms])

  useEffect(() => { loadAlumni() }, [loadAlumni])

  const handleSelect = (selected: Alumni) => {
    navigate(`/profiling/${selected.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Alumni Profiling</h1>
          <p className="text-sm text-text-secondary">Search and view detailed alumni profiles and update history</p>
        </div>
      </div>

      <ProfileSearch onSelect={handleSelect} />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : alumni.length === 0 ? (
        <div className="rounded-xl border border-card-border bg-card p-12 text-center">
          <Users className="mx-auto h-10 w-10 text-text-secondary" />
          <p className="mt-3 text-text-secondary">No alumni records found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {alumni.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => navigate(`/profiling/${a.id}`)}
              className="flex items-start gap-3 rounded-xl border border-card-border bg-card p-4 text-left shadow-sm transition-colors hover:bg-surface-secondary"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-text-primary">{a.full_name}</p>
                <p className="text-xs text-text-secondary">
                  {PROGRAM_LABELS[a.program] ?? a.program} — Class of {a.year_graduated}
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  {a.is_employed === 1 ? (a.current_position ?? 'Employed') : 'Not employed'}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
