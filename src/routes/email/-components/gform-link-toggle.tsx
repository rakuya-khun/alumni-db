import { Link2 } from 'lucide-react'

interface GformLinkToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
}

export function GformLinkToggle({ enabled, onChange }: GformLinkToggleProps) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-card-border bg-surface-secondary px-4 py-3 cursor-pointer">
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-card-border text-primary focus:ring-primary"
      />
      <Link2 className="h-4 w-4 text-text-secondary" />
      <span className="text-sm text-text-primary">Include Google Form link in email</span>
    </label>
  )
}
