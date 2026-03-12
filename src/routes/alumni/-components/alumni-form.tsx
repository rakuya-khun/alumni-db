import { Loader2, Save, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAlumniForm } from '../-hooks/use-alumni-form'
import {
  RespondentInfoFields,
  AcademicProfileFields,
  CompetenciesFields,
  LicensureFields,
  EmploymentFields,
  CareerProgressionFields,
} from './alumni-form-fields'
import type { Alumni } from '../../../../shared/types/alumni.types'

interface AlumniFormProps {
  mode: 'create' | 'edit'
  defaultValues?: Partial<Alumni>
}

export function AlumniForm({ mode, defaultValues }: AlumniFormProps) {
  const { form, onSubmit, selectedProgram, isSubmitting } = useAlumniForm({
    mode,
    defaultValues,
  })

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
        <RespondentInfoFields form={form} />
      </div>

      <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
        <AcademicProfileFields form={form} />
      </div>

      <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
        <CompetenciesFields form={form} />
      </div>

      <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
        <LicensureFields form={form} />
      </div>

      <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
        <EmploymentFields form={form} selectedProgram={selectedProgram} />
      </div>

      <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
        <CareerProgressionFields form={form} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/alumni"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-card-border px-6 text-sm font-medium text-text-primary hover:bg-surface-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Directory
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary-light disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {mode === 'create' ? 'Save Record' : 'Update Record'}
        </button>
      </div>
    </form>
  )
}
