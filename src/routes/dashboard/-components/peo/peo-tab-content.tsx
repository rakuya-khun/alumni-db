import { Loader2, Sprout, TreePine, Mountain } from 'lucide-react'
import { usePeoStore } from '../../../../stores/peo.store'
import { PeoIndicatorRow } from './peo-indicator-row'
import { CohortCard } from './cohort-card'
import { DataFieldsUsed } from './data-fields-used'
import { ProcessingLogic } from './processing-logic'
import type { PeoRate } from '../../../../../shared/types/peo.types'

function PeoBreakdown({ rate }: { rate: PeoRate }) {
  const entries = Object.entries(rate.indicators)
  if (entries.length === 0) {
    return (
      <p className="rounded-lg bg-surface-secondary px-4 py-3 text-sm text-text-muted">
        No indicator data available.
      </p>
    )
  }
  return (
    <div className="rounded-lg border border-card-border bg-card px-4">
      {entries.map(([key, ind]) => (
        <PeoIndicatorRow
          key={key}
          label={ind.label}
          count={ind.count}
          denominator={rate.denominator}
        />
      ))}
    </div>
  )
}

export function PeoTabContent() {
  const { selectedTab, result, outcomes, loading } = usePeoStore()

  if (loading && !result && !outcomes) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-3 text-sm text-text-secondary">Loading PEO details...</span>
      </div>
    )
  }

  if (selectedTab === 'outcomes') {
    if (!outcomes) {
      return (
        <p className="rounded-lg bg-surface-secondary px-4 py-3 text-sm text-text-muted">
          Outcome rates not available yet.
        </p>
      )
    }
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <CohortCard
            title="Recent Graduates"
            subtitle="0–2 years since graduation"
            icon={<Sprout className="h-8 w-8" />}
            data={outcomes.cohorts.recent}
          />
          <CohortCard
            title="Mid-Career"
            subtitle="3–5 years since graduation"
            icon={<TreePine className="h-8 w-8" />}
            data={outcomes.cohorts.mid}
          />
          <CohortCard
            title="Established"
            subtitle="6+ years since graduation"
            icon={<Mountain className="h-8 w-8" />}
            data={outcomes.cohorts.established}
          />
        </div>
        <DataFieldsUsed tab="outcomes" />
        <ProcessingLogic tab="outcomes" outcomes={outcomes} asOfYear={outcomes.asOfYear} />
      </div>
    )
  }

  if (!result) {
    return (
      <p className="rounded-lg bg-surface-secondary px-4 py-3 text-sm text-text-muted">
        PEO rates not available yet.
      </p>
    )
  }

  const peoRate = selectedTab === 'peo1' ? result.peo1 : selectedTab === 'peo2' ? result.peo2 : result.peo3

  return (
    <div className="space-y-4">
      <PeoBreakdown rate={peoRate} />
      <DataFieldsUsed tab={selectedTab} />
      <ProcessingLogic tab={selectedTab} rate={peoRate} denominatorMode={result.denominatorMode} />
    </div>
  )
}
