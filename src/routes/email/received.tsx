import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ReceivedEmailsTable } from './-components/received-emails-table'
import { useReceivedEmails } from './-hooks/use-received-emails'

export default function EmailReceivedPage() {
  const { received, loading } = useReceivedEmails()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/email" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Email
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-text-primary">Received Emails</h1>
      <p className="text-sm text-text-secondary">Manually logged email responses from alumni</p>
      <ReceivedEmailsTable received={received} loading={loading} />
    </div>
  )
}
