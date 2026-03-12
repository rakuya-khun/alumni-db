import { Users } from 'lucide-react'

interface RecipientCountProps {
  count: number
  loading: boolean
}

export function RecipientCount({ count, loading }: RecipientCountProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-surface-secondary px-4 py-3">
      <Users className="h-4 w-4 text-text-secondary" />
      <span className="text-sm text-text-primary">
        {loading ? 'Counting recipients...' : (
          <><strong>{count}</strong> recipient{count !== 1 ? 's' : ''} with valid Gmail address</>
        )}
      </span>
    </div>
  )
}
