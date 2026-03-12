import { AlertTriangle } from 'lucide-react'
import { useUnpushedAlert } from '../-hooks/use-unpushed-alert'

export function UnpushedNotification() {
  const { hasUnpushed, unpushedCount } = useUnpushedAlert()

  if (!hasUnpushed) return null

  return (
    <div className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4">
      <AlertTriangle className="h-5 w-5 text-warning" />
      <span className="text-sm font-medium text-text-primary">
        You have {unpushedCount} unpushed edit{unpushedCount !== 1 ? 's' : ''}. Push to sync with Google Sheets.
      </span>
    </div>
  )
}
