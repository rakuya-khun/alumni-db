import { useState } from 'react'
import { ipcClient } from '../../../data/ipc-client'
import { useToast } from '../../../hooks/use-toast'
import type { AlumniFilters } from '../../../../shared/types/alumni.types'

export function useEmailSend() {
  const toast = useToast()
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number; errors: string[] } | null>(null)

  const send = async (payload: {
    subject: string
    body: string
    recipientFilters: AlumniFilters
    includeGformLink: boolean
  }) => {
    setSending(true)
    setResult(null)
    try {
      const res = await ipcClient.email.send(payload)
      setResult(res)
      if (res.failed === 0) {
        toast.success(`All ${res.sent} emails sent successfully`)
      } else {
        toast.warning(`${res.sent} sent, ${res.failed} failed`)
      }
    } catch (err) {
      toast.error('Failed to send emails', (err as Error).message)
    } finally {
      setSending(false)
    }
  }

  return { send, sending, result }
}
