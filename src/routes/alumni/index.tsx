import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useAlumniFilters } from './-hooks/use-alumni-filters'
import { useAlumni } from './-hooks/use-alumni'
import { AlumniTableToolbar } from './-components/alumni-table-toolbar'
import { AlumniTable } from './-components/alumni-table'
import { DeleteConfirmDialog } from './-components/delete-confirm-dialog'
import type { Alumni } from '../../../shared/types/alumni.types'

export default function AlumniDirectoryPage() {
  const navigate = useNavigate()
  const {
    filters, searchInput, setSearchInput,
    programs, setPrograms,
    syncStatus, setSyncStatus,
    isEmployed, setIsEmployed,
    hasLicense, setHasLicense,
    specialization, setSpecialization,
    specializationOptions,
    workRegion, setWorkRegion,
    workRegionOptions,
    employmentPosition, setEmploymentPosition,
    employmentPositionOptions,
    hasActiveFilters, clearFilters,
  } = useAlumniFilters()
  const { alumni, loading, remove } = useAlumni(filters)
  const [deleteTarget, setDeleteTarget] = useState<Alumni | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await remove(deleteTarget.id)
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Alumni Directory</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {(alumni ?? []).length} record{(alumni ?? []).length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button
          onClick={() => navigate('/alumni/add')}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary-light"
        >
          <Plus className="h-4 w-4" />
          Add Alumni
        </button>
      </div>

      <AlumniTableToolbar
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        programs={programs}
        onProgramsChange={setPrograms}
        syncStatus={syncStatus}
        onSyncStatusChange={setSyncStatus}
        isEmployed={isEmployed}
        onIsEmployedChange={setIsEmployed}
        hasLicense={hasLicense}
        onHasLicenseChange={setHasLicense}
        specialization={specialization}
        setSpecialization={setSpecialization}
        specializationOptions={specializationOptions}
        workRegion={workRegion}
        setWorkRegion={setWorkRegion}
        workRegionOptions={workRegionOptions}
        employmentPosition={employmentPosition}
        setEmploymentPosition={setEmploymentPosition}
        employmentPositionOptions={employmentPositionOptions}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <p className="text-text-muted">Loading alumni records...</p>
        </div>
      ) : (
        <AlumniTable
          alumni={alumni}
          onEdit={(id) => navigate(`/alumni/edit/${id}`)}
          onDelete={setDeleteTarget}
        />
      )}

      <DeleteConfirmDialog
        name={deleteTarget?.full_name ?? ''}
        open={deleteTarget != null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}