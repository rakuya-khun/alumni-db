import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface SendProgressProps {
  sending: boolean
  result: { sent: number; failed: number; errors: string[] } | null
}

export function SendProgress({ sending, result }: SendProgressProps) {
  if (!sending && !result) return null

  if (sending) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm font-medium text-text-primary">Sending emails...</span>
      </div>
    )
  }

  if (!result) return null

  const allSuccess = result.failed === 0

  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${allSuccess ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'}`}>
      {allSuccess ? (
        <CheckCircle className="h-5 w-5 text-success" />
      ) : (
        <AlertCircle className="h-5 w-5 text-warning" />
      )}
      <div>
        <p className="text-sm font-medium text-text-primary">
          {result.sent} email{result.sent !== 1 ? 's' : ''} sent successfully
          {result.failed > 0 && `, ${result.failed} failed`}
        </p>
        {result.errors.length > 0 && (
          <ul className="mt-2 space-y-1">
            {result.errors.slice(0, 5).map((err, i) => (
              <li key={i} className="text-xs text-error">{err}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
