import { useState, useEffect, useCallback } from 'react'
import { ipcClient } from '../../../data/ipc-client'

export function useReceivedEmails() {
  const [received, setReceived] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await ipcClient.email.getReceived()
      setReceived(data)
    } catch {
      setReceived([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { received, loading, refresh }
}
