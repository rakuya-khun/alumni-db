import { Link } from 'react-router-dom'
import { User } from 'lucide-react'

interface ViewProfileButtonProps {
  alumniId: number
}

export function ViewProfileButton({ alumniId }: ViewProfileButtonProps) {
  return (
    <Link
      to={`/profiling/${alumniId}`}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
    >
      <User className="h-3.5 w-3.5" />
      View Profile
    </Link>
  )
}