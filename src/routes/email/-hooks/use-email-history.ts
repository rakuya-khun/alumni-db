import { useState, useEffect, useCallback } from 'react'
import { ipcClient } from '../../../data/ipc-client'

export function useEmailHistory() {
  const [history, setHistory] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await ipcClient.email.getHistory()
      setHistory(data)
    } catch {
      setHistory([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { history, loading, refresh }
}
