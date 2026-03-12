import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { ipcClient } from '../../data/ipc-client'
import { AlumniForm } from './-components/alumni-form'
import type { Alumni } from '../../../shared/types/alumni.types'

export default function AlumniEditPage() {
  const { id } = useParams<{ id: string }>()
  const [alumni, setAlumni] = useState<Alumni | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const numId = Number(id)
    if (Number.isNaN(numId)) {
      setError('Invalid alumni ID.')
      setLoading(false)
      return
    }

    ipcClient.alumni.getById(numId)
      .then((data) => setAlumni(data))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false))
  }, [id])

  if (!id) return <Navigate to="/alumni" replace />

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-text-secondary">Loading record...</span>
      </div>
    )
  }

  if (error || !alumni) {
    return (
      <div className="rounded-xl border border-error/20 bg-error/5 p-6 text-center">
        <p className="text-error">{error ?? 'Alumni record not found.'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Edit Alumni Record</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Editing record for <strong>{alumni.full_name}</strong>. Changes will create a history snapshot.
        </p>
      </div>
      <AlumniForm mode="edit" defaultValues={alumni} />
    </div>
  )
}