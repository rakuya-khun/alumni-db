import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, Pencil, Trash2 } from 'lucide-react'
import type { Alumni } from '../../../../shared/types/alumni.types'
import { PROGRAM_LABELS } from '../-constants'
import { SyncBadge } from './sync-badge'
import { ViewProfileButton } from './view-profile-button'

type SortField = 'full_name' | 'program' | 'year_graduated' | 'is_employed' | 'sync_status'
type SortDirection = 'asc' | 'desc'

interface AlumniTableProps {
  alumni: Alumni[]
  onEdit: (id: number) => void
  onDelete: (alumni: Alumni) => void
}

const PAGE_SIZE = 20

export function AlumniTable({ alumni, onEdit, onDelete }: AlumniTableProps) {
  const [sortField, setSortField] = useState<SortField>('full_name')
  const [sortDir, setSortDir] = useState<SortDirection>('asc')
  const [page, setPage] = useState(0)

  const safeAlumni = alumni ?? []

  const sorted = useMemo(() => {
    const copy = [...safeAlumni]
    copy.sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortDir === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number)
    })
    return copy
  }, [safeAlumni, sortField, sortDir])

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
    setPage(0)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDir === 'asc' ? (
      <ChevronUp className="inline h-3.5 w-3.5" />
    ) : (
      <ChevronDown className="inline h-3.5 w-3.5" />
    )
  }

  if (safeAlumni.length === 0) {
    return (
      <div className="rounded-xl border border-card-border bg-card p-12 text-center shadow-sm">
        <p className="text-text-muted">No alumni records found.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-card-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-card-border bg-surface-secondary/50">
              {([
                ['full_name', 'Name'],
                ['program', 'Program'],
                ['year_graduated', 'Year'],
                ['is_employed', 'Employed'],
                ['sync_status', 'Sync'],
              ] as [SortField, string][]).map(([field, label]) => (
                <th
                  key={field}
                  onClick={() => toggleSort(field)}
                  className="cursor-pointer px-4 py-3 text-left font-medium text-text-secondary hover:text-text-primary"
                >
                  {label} <SortIcon field={field} />
                </th>
              ))}
              <th className="px-4 py-3 text-right font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((a) => (
              <tr key={a.id} className="border-b border-card-border/50 last:border-0 hover:bg-surface-secondary/30">
                <td className="px-4 py-3 font-medium text-text-primary">{a.full_name}</td>
                <td className="px-4 py-3 text-text-secondary">{PROGRAM_LABELS[a.program] ?? a.program}</td>
                <td className="px-4 py-3 text-text-secondary">{a.year_graduated}</td>
                <td className="px-4 py-3 text-text-secondary">{a.is_employed === 1 ? 'Yes' : a.is_employed === 0 ? 'No' : '—'}</td>
                <td className="px-4 py-3"><SyncBadge status={a.sync_status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <ViewProfileButton alumniId={a.id} />
                    <button
                      onClick={() => onEdit(a.id)}
                      className="rounded-lg p-1.5 text-text-muted hover:bg-primary/10 hover:text-primary"
                      title="Edit record"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(a)}
                      className="rounded-lg p-1.5 text-text-muted hover:bg-error/10 hover:text-error"
                      title="Delete record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-card-border px-4 py-3">
          <p className="text-xs text-text-muted">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} of {sorted.length}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="h-8 rounded-lg border border-card-border px-3 text-xs text-text-primary disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="h-8 rounded-lg border border-card-border px-3 text-xs text-text-primary disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
