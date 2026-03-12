import { useState, useEffect } from 'react'
import { ipcClient } from '@/data/ipc-client'

export function useAppVersion() {
  const [version, setVersion] = useState('...')

  useEffect(() => {
    ipcClient.system.getVersion().then(setVersion).catch(() => setVersion('unknown'))
  }, [])

  return version
}
