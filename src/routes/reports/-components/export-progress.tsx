import { LoaderCircle, CheckCircle2 } from 'lucide-react'

interface ExportProgressProps {
  exporting: boolean
  lastPath: string | null
}

export function ExportProgress({ exporting, lastPath }: ExportProgressProps) {
  if (!exporting && !lastPath) return null

  return (
    <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
      {exporting ? (
        <div className="flex items-center gap-3">
          <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-text-secondary">Generating report...</span>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <span className="text-sm text-text-primary">Export complete — file saved</span>
        </div>
      )}
    </div>
  )
}
