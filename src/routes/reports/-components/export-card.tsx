import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

interface ExportCardProps {
  title: string
  description: string
  icon: LucideIcon
  onClick: () => void
  disabled?: boolean
}

export function ExportCard({ title, description, icon: Icon, onClick, disabled }: ExportCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex flex-col items-start gap-3 rounded-xl border border-card-border bg-card p-6 text-left shadow-sm transition-colors',
        'hover:bg-surface-secondary',
        'disabled:cursor-not-allowed disabled:opacity-50'
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-text-primary">{title}</h3>
        <p className="mt-1 text-sm text-text-secondary">{description}</p>
      </div>
    </button>
  )
}
