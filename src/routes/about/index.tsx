import { useState } from 'react'
import { Info, Grid3x3, BookOpen } from 'lucide-react'
import { SystemInfoSection } from './-components/system-info-section'
import { CoreFeaturesSection } from './-components/core-features-section'
import { UserManualSection } from './-components/user-manual-section'

const TABS = [
  { id: 'info', label: 'System Info', icon: Info },
  { id: 'features', label: 'Features', icon: Grid3x3 },
  { id: 'manual', label: 'User Manual', icon: BookOpen },
] as const

type TabId = (typeof TABS)[number]['id']

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<TabId>('info')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">About Alumni DB</h1>
        <p className="text-sm text-text-secondary">System overview, features, and quick reference</p>
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
        {activeTab === 'info' && <SystemInfoSection />}
        {activeTab === 'features' && <CoreFeaturesSection />}
        {activeTab === 'manual' && <UserManualSection />}
      </div>
    </div>
  )
}
