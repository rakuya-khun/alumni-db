import { useUIStore, type FontSize } from '@/stores/ui.store'
import { useSettings } from './use-settings'
import { useCallback, useEffect } from 'react'

const VALID_SIZES: FontSize[] = ['small', 'default', 'large', 'x-large']

export function useFontSize() {
  const { fontSize, setFontSize } = useUIStore()
  const { config, save } = useSettings()

  useEffect(() => {
    const saved = config.font_size as FontSize | null | undefined
    if (saved && VALID_SIZES.includes(saved)) {
      setFontSize(saved)
    }
  }, [config.font_size, setFontSize])

  const changeFontSize = useCallback(async (size: FontSize) => {
    const prev = fontSize
    setFontSize(size)
    try {
      await save({ font_size: size })
    } catch {
      setFontSize(prev)
    }
  }, [fontSize, setFontSize, save])

  return { fontSize, changeFontSize }
}
