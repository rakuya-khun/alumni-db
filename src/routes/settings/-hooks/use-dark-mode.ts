import { useUIStore, type Theme } from '@/stores/ui.store'
import { useSettings } from './use-settings'
import { useCallback, useEffect } from 'react'

const VALID_THEMES: Theme[] = ['light', 'dark', 'maroon']

export function useDarkMode() {
  const { theme, isDarkMode, setTheme, cycleTheme } = useUIStore()
  const { config, save } = useSettings()

  // Restore persisted theme on load
  useEffect(() => {
    const saved = config.dark_mode
    if (saved && VALID_THEMES.includes(saved as Theme)) {
      setTheme(saved as Theme)
    } else if (saved === 'true') {
      setTheme('dark')
    } else if (saved === 'false') {
      setTheme('light')
    }
  }, [config.dark_mode, setTheme])

  const toggle = useCallback(async () => {
    cycleTheme()
    const nextIdx = (VALID_THEMES.indexOf(theme) + 1) % VALID_THEMES.length
    const next = VALID_THEMES[nextIdx]
    try {
      await save({ dark_mode: next })
    } catch {
      // revert on failure
      setTheme(theme)
    }
  }, [theme, cycleTheme, setTheme, save])

  const selectTheme = useCallback(async (t: Theme) => {
    const prev = theme
    setTheme(t)
    try {
      await save({ dark_mode: t })
    } catch {
      setTheme(prev)
    }
  }, [theme, setTheme, save])

  return { theme, isDarkMode, toggle, selectTheme }
}
