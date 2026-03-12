import { Timer } from 'lucide-react'
import { useAutoSync } from '../-hooks/use-auto-sync'
import { cn } from '../../../lib/cn'

export function AutoSyncConfig() {
  const { autoSyncEnabled, interval, setInterval, toggle } = useAutoSync()

  return (
    <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Timer className="h-5 w-5 text-text-secondary" />
        <h3 className="text-sm font-semibold text-text-primary">Auto-Sync</h3>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-text-primary">
          <span>Every</span>
          <input
            type="number"
            min={10}
            max={3600}
            value={interval}
            onChange={(e) => setInterval(Math.max(10, Number(e.target.value)))}
            disabled={autoSyncEnabled}
            className="h-9 w-20 rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary disabled:opacity-50"
          />
          <span>seconds</span>
        </label>

        <button
          type="button"
          onClick={toggle}
          className={cn(
            'rounded-lg px-6 py-2 text-sm font-medium transition-colors',
            autoSyncEnabled
              ? 'bg-error/10 text-error hover:bg-error/20'
              : 'bg-primary text-primary-foreground hover:bg-primary-light'
          )}
        >
          {autoSyncEnabled ? 'Stop Auto-Sync' : 'Start Auto-Sync'}
        </button>
      </div>

      {autoSyncEnabled && (
        <p className="mt-3 text-xs text-success">Auto-sync is active. Syncing every {interval} seconds.</p>
      )}
    </div>
  )
}
