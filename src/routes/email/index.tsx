import { Link } from 'react-router-dom'
import { PenSquare, History, Inbox } from 'lucide-react'

const ACTIONS = [
  { to: '/email/compose', icon: PenSquare, title: 'Compose Email', desc: 'Send a new email to alumni recipients' },
  { to: '/email/history', icon: History, title: 'Email History', desc: 'View previously sent emails and their status' },
  { to: '/email/received', icon: Inbox, title: 'Received Emails', desc: 'View logged email responses from alumni' },
]

export default function EmailHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Email</h1>
        <p className="text-sm text-text-secondary">Send emails to alumni and track communication</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {ACTIONS.map(({ to, icon: Icon, title, desc }) => (
          <Link
            key={to}
            to={to}
            className="flex items-start gap-4 rounded-xl border border-card-border bg-card p-6 shadow-sm transition-colors hover:bg-surface-secondary"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-text-primary">{title}</h2>
              <p className="mt-1 text-sm text-text-secondary">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
