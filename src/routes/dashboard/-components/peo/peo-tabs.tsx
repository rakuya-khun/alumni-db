import { usePeoStore, type PeoTab } from '../../../../stores/peo.store'

const TABS: { id: PeoTab; label: string }[] = [
  { id: 'peo1', label: 'PEO 1' },
  { id: 'peo2', label: 'PEO 2' },
  { id: 'peo3', label: 'PEO 3' },
  { id: 'outcomes', label: 'Outcomes' },
]

export function PeoTabs() {
  const { selectedTab, setSelectedTab } = usePeoStore()

  return (
    <div className="border-b border-card-border">
      <div className="flex gap-2">
        {TABS.map((tab) => {
          const active = selectedTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedTab(tab.id)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm transition-colors ${
                active
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
