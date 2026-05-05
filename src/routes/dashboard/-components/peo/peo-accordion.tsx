import { ChevronDown, BarChart3 } from 'lucide-react'
import { usePeoStore } from '../../../../stores/peo.store'
import { PeoFilters } from './peo-filters'
import { PeoTabs } from './peo-tabs'
import { PeoTabContent } from './peo-tab-content'
import type { PeoFilters as PeoFiltersValue } from '../../../../../shared/types/peo.types'

interface PeoAccordionProps {
  peoFilters: PeoFiltersValue
  onPeoFiltersChange: (next: PeoFiltersValue) => void
}

export function PeoAccordion({ peoFilters, onPeoFiltersChange }: PeoAccordionProps) {
  const { accordionOpen, setAccordionOpen } = usePeoStore()

  return (
    <div className="rounded-xl border border-card-border bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setAccordionOpen(!accordionOpen)}
        className="flex w-full items-center justify-between rounded-xl px-6 py-3 text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-text-secondary" />
          <span>PEO Details &amp; Filters</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-text-secondary transition-transform ${
            accordionOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          accordionOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-card-border px-6 py-4 space-y-4">
          <PeoFilters value={peoFilters} onChange={onPeoFiltersChange} />
          <div className="border-t border-card-border" />
          <PeoTabs />
          <PeoTabContent />
        </div>
      </div>
    </div>
  )
}
