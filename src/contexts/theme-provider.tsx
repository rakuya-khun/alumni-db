import { useEffect, type ReactNode } from 'react'
import { useUIStore, type Theme } from '../stores/ui.store'
import { ipcClient } from '../data/ipc-client'

const VALID_THEMES: Theme[] = ['light', 'dark', 'maroon']

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { setTheme } = useUIStore()

  useEffect(() => {
    ipcClient.settings
      .get()
      .then((config) => {
        const saved = config.dark_mode
        if (saved && VALID_THEMES.includes(saved as Theme)) {
          setTheme(saved as Theme)
        } else if (saved === 'true') {
          setTheme('dark')
        }
      })
      .catch(() => {
        // Settings not available yet — use default (light)
      })
  }, [setTheme])

  return <>{children}</>
}
