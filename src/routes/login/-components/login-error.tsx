import { AlertCircle } from 'lucide-react'

export function LoginError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-error/30 bg-error/10 p-4">
      <AlertCircle size={20} className="shrink-0 text-error" />
      <p className="text-sm text-error">{message}</p>
    </div>
  )
}
