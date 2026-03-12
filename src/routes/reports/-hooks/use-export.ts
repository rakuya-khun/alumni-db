import { useState } from 'react'
import { ipcClient } from '@/data/ipc-client'
import { useToast } from '@/hooks/use-toast'
import type { AlumniFilters } from '../../../../shared/types/alumni.types'

type ExportFormat = 'pdf' | 'docx' | 'excel'

export function useExport() {
  const toast = useToast()
  const [exporting, setExporting] = useState(false)
  const [lastPath, setLastPath] = useState<string | null>(null)

  const generate = async (format: ExportFormat, filters: AlumniFilters) => {
    setExporting(true)
    setLastPath(null)
    try {
      const path = await ipcClient.export[format](filters)
      setLastPath(path)
      toast.success('Export complete', `File saved successfully`)
    } catch (err) {
      toast.error('Export failed', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setExporting(false)
    }
  }

  return { generate, exporting, lastPath }
}
