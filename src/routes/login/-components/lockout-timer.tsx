import { ShieldAlert } from 'lucide-react'

export function LockoutTimer({ remainingSeconds }: { remainingSeconds: number }) {
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60

  return (
    <div className="flex items-center gap-3 rounded-xl border border-error/30 bg-error/10 p-4">
      <ShieldAlert size={24} className="shrink-0 text-error" />
      <div>
        <p className="text-sm font-semibold text-error">Account temporarily locked</p>
        <p className="text-xs text-error/80">
          Too many failed attempts. Try again in{' '}
          <span className="font-mono font-bold">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </p>
      </div>
    </div>
  )
}
