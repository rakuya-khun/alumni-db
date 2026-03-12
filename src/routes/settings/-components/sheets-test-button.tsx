import { useState } from 'react'
import { Zap, LoaderCircle, CheckCircle2, XCircle } from 'lucide-react'

interface SheetsTestButtonProps {
  onTest: () => Promise<void>
  disabled?: boolean
}

export function SheetsTestButton({ onTest, disabled }: SheetsTestButtonProps) {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle')

  const handleTest = async () => {
    setStatus('testing')
    try {
      await onTest()
      setStatus('success')
    } catch {
      setStatus('failed')
    }
  }

  return (
    <button
      type="button"
      onClick={handleTest}
      disabled={disabled || status === 'testing'}
      className="inline-flex items-center gap-2 rounded-lg border border-card-border px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-secondary disabled:opacity-50"
    >
      {status === 'testing' && <LoaderCircle className="h-4 w-4 animate-spin" />}
      {status === 'success' && <CheckCircle2 className="h-4 w-4 text-success" />}
      {status === 'failed' && <XCircle className="h-4 w-4 text-error" />}
      {status === 'idle' && <Zap className="h-4 w-4" />}
      {status === 'testing' ? 'Testing...' : status === 'success' ? 'Connected' : status === 'failed' ? 'Failed — Retry' : 'Test Connection'}
    </button>
  )
}
