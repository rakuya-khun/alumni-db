import { History, Sparkles, GitBranch } from 'lucide-react'
import { cn } from '../../../lib/cn'
import type { DisplayMode } from '../-types/profiling.types'

const TABS: { mode: DisplayMode; label: string; icon: React.ElementType }[] = [
  { mode: 'history', label: 'Full History', icon: History },
  { mode: 'latest', label: 'Latest Updates', icon: Sparkles },
  { mode: 'timeline', label: 'Timeline', icon: GitBranch },
]

interface DisplayViewTabsProps {
  current: DisplayMode
  onChange: (mode: DisplayMode) => void
}

export function DisplayViewTabs({ current, onChange }: DisplayViewTabsProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-surface-secondary p-1">
      {TABS.map(({ mode, label, icon: Icon }) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          className={cn(
            'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            current === mode
              ? 'bg-card text-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  )
}
