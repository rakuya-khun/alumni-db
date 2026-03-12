import { Timer } from 'lucide-react'

interface AutoSyncSettingsProps {
  enabled: boolean
  interval: number
  onToggle: (enabled: boolean) => void
  onIntervalChange: (seconds: number) => void
  disabled?: boolean
}

export function AutoSyncConfig({ enabled, interval, onToggle, onIntervalChange, disabled }: AutoSyncSettingsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-text-primary">Auto-Sync</h3>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          disabled={disabled}
          className="h-5 w-5 rounded border-card-border text-primary accent-primary"
        />
        <span className="text-sm text-text-primary">Enable automatic synchronization with Google Sheets</span>
      </label>

      {enabled && (
        <div className="flex items-center gap-3">
          <Timer className="h-4 w-4 text-text-secondary" />
          <label className="text-sm text-text-secondary">Sync every</label>
          <input
            type="number"
            min={10}
            max={3600}
            value={interval}
            onChange={(e) => onIntervalChange(Number(e.target.value))}
            disabled={disabled}
            className="h-9 w-20 rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary"
          />
          <span className="text-sm text-text-secondary">seconds</span>
        </div>
      )}
    </div>
  )
}
