import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { EmailHistoryTable } from './-components/email-history-table'
import { useEmailHistory } from './-hooks/use-email-history'

export default function EmailHistoryPage() {
  const { history, loading } = useEmailHistory()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/email" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Email
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-text-primary">Email History</h1>
      <EmailHistoryTable history={history} loading={loading} />
    </div>
  )
}
