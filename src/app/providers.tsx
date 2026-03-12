import type { ReactNode } from 'react'
import { ThemeProvider } from '../contexts/theme-provider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}
