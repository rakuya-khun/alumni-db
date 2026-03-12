import { Moon, Sun, Palette } from 'lucide-react'
import { useDarkMode } from '../-hooks/use-dark-mode'
import type { Theme } from '@/stores/ui.store'
import { cn } from '@/lib/cn'

const THEMES: { value: Theme; label: string; icon: typeof Sun; desc: string }[] = [
  { value: 'light', label: 'Light', icon: Sun, desc: 'Clean white interface' },
  { value: 'dark', label: 'Dark', icon: Moon, desc: 'Easy on the eyes' },
  { value: 'maroon', label: 'Maroon', icon: Palette, desc: 'Warm SLSU classic' },
]

export function DarkModeToggle() {
  const { theme, selectTheme } = useDarkMode()

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-text-primary">Theme</p>
      <div className="grid grid-cols-3 gap-3">
        {THEMES.map((t) => {
          const isActive = theme === t.value
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => selectTheme(t.value)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors',
                isActive
                  ? 'border-primary bg-primary/5'
                  : 'border-card-border hover:border-primary/40'
              )}
            >
              <t.icon className={cn('h-6 w-6', isActive ? 'text-primary' : 'text-text-secondary')} />
              <span className={cn('text-sm font-medium', isActive ? 'text-primary' : 'text-text-primary')}>{t.label}</span>
              <span className="text-xs text-text-muted text-center">{t.desc}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
