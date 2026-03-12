import { useState } from 'react'
import { Search, BookOpen, HelpCircle, Wrench } from 'lucide-react'
import { UserManualTab } from './-components/user-manual-tab'
import { FaqTab } from './-components/faq-tab'
import { TroubleshootingTab } from './-components/troubleshooting-tab'

const TABS = [
  { id: 'manual', label: 'User Manual', icon: BookOpen },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'troubleshooting', label: 'Troubleshooting', icon: Wrench },
] as const

type TabId = (typeof TABS)[number]['id']

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState<TabId>('manual')
  const [search, setSearch] = useState('')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Help & Support</h1>
        <p className="text-sm text-text-secondary">Guides, answers, and solutions for using Alumni DB</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search help topics..."
          className="h-10 w-full rounded-lg border border-card-border bg-surface-primary pl-10 pr-3 text-sm text-text-primary placeholder:text-text-muted"
        />
      </div>

      <div className="flex gap-1 border-b border-card-border">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === id
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
        {activeTab === 'manual' && <UserManualTab searchQuery={search} />}
        {activeTab === 'faq' && <FaqTab searchQuery={search} />}
        {activeTab === 'troubleshooting' && <TroubleshootingTab searchQuery={search} />}
      </div>
    </div>
  )
}
