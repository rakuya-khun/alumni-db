import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useAlumniStore } from '../../../stores/alumni.store'
import { useToast } from '../../../hooks/use-toast'
import { alumniSchema } from '../-schemas/alumni.schema'
import type { AlumniFormData } from '../-schemas/alumni.schema'
import type { Alumni } from '../../../../shared/types/alumni.types'

interface UseAlumniFormOptions {
  mode: 'create' | 'edit'
  defaultValues?: Partial<Alumni>
}

export function useAlumniForm({ mode, defaultValues }: UseAlumniFormOptions) {
  const navigate = useNavigate()
  const { create, update } = useAlumniStore()
  const { success, error: showError } = useToast()

  const form = useForm<AlumniFormData>({
    resolver: zodResolver(alumniSchema),
    defaultValues: defaultValues as AlumniFormData | undefined,
  })

  const selectedProgram = form.watch('program')

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      if (mode === 'create') {
        await create(data as unknown as Record<string, unknown>)
        success('Alumni record created successfully.')
      } else if (defaultValues?.id) {
        await update(defaultValues.id, data as unknown as Record<string, unknown>)
        success('Alumni record updated successfully.')
      }
      navigate('/alumni')
    } catch (err) {
      showError((err as Error).message || 'Failed to save alumni record.')
    }
  })

  return {
    form,
    onSubmit,
    selectedProgram,
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
  }
}