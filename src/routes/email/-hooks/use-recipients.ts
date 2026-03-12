import { useState, useEffect, useCallback } from 'react'
import { ipcClient } from '../../../data/ipc-client'
import { useAuth } from '../../../hooks/use-auth'
import type { Alumni, AlumniFilters } from '../../../../shared/types/alumni.types'

export function useRecipients() {
  const { accessiblePrograms } = useAuth()
  const [recipients, setRecipients] = useState<Alumni[]>([])
  const [filters, setFilters] = useState<AlumniFilters>({ programs: accessiblePrograms })
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const all = await ipcClient.alumni.getAll({ ...filters, programs: filters.programs?.length ? filters.programs : accessiblePrograms })
      setRecipients(all.filter((a) => a.gmail_address))
    } catch {
      setRecipients([])
    } finally {
      setLoading(false)
    }
  }, [filters, accessiblePrograms])

  useEffect(() => { refresh() }, [refresh])

  const updateFilters = (partial: Partial<AlumniFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }))
  }

  return { recipients, filters, updateFilters, loading, validCount: recipients.length }
}
