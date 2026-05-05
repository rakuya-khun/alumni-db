import { Award, HeartHandshake, Lightbulb, Target } from 'lucide-react'
import { usePeoStore } from '../../../../stores/peo.store'
import { PeoStatCard } from './peo-stat-card'

const SKELETON_KEYS = ['s1', 's2', 's3', 's4'] as const

function SkeletonCard({ highlighted = false }: { highlighted?: boolean }) {
  return (
    <div
      className={`h-[124px] animate-pulse rounded-xl p-6 shadow-sm ${
        highlighted ? 'bg-primary/40' : 'border border-card-border bg-surface-secondary'
      }`}
    >
      <div className="h-3 w-1/3 rounded bg-text-muted/30" />
      <div className="mt-3 h-6 w-1/2 rounded bg-text-muted/30" />
      <div className="mt-3 h-3 w-2/3 rounded bg-text-muted/30" />
    </div>
  )
}

export function PeoCardsRow() {
  const { result, outcomes, loading, openWithTab } = usePeoStore()

  if (loading && !result && !outcomes) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {SKELETON_KEYS.map((k, i) => (
          <SkeletonCard key={k} highlighted={i === 3} />
        ))}
      </div>
    )
  }

  const peo1 = result?.peo1
  const peo2 = result?.peo2
  const peo3 = result?.peo3

  const outcomesInsufficient = (outcomes?.overallTotal ?? 0) < 10

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <PeoStatCard
        label="PEO 1"
        subtitle={peo1 ? 'Professional Competence' : 'Compute pending'}
        icon={<Award className="h-8 w-8" />}
        rate={peo1?.rate ?? 0}
        numerator={peo1?.passing ?? 0}
        denominator={peo1?.denominator ?? 0}
        insufficient={peo1?.insufficient ?? false}
        onClick={() => openWithTab('peo1')}
      />
      <PeoStatCard
        label="PEO 2"
        subtitle={peo2 ? 'Ethics & Social Responsibility' : 'Compute pending'}
        icon={<HeartHandshake className="h-8 w-8" />}
        rate={peo2?.rate ?? 0}
        numerator={peo2?.passing ?? 0}
        denominator={peo2?.denominator ?? 0}
        insufficient={peo2?.insufficient ?? false}
        onClick={() => openWithTab('peo2')}
      />
      <PeoStatCard
        label="PEO 3"
        subtitle={peo3 ? 'Innovation & Sustainability' : 'Compute pending'}
        icon={<Lightbulb className="h-8 w-8" />}
        rate={peo3?.rate ?? 0}
        numerator={peo3?.passing ?? 0}
        denominator={peo3?.denominator ?? 0}
        insufficient={peo3?.insufficient ?? false}
        onClick={() => openWithTab('peo3')}
      />
      <PeoStatCard
        label="Outcomes"
        subtitle={outcomes ? 'Field-Aligned Employment' : 'Compute pending'}
        icon={<Target className="h-8 w-8" />}
        rate={outcomes?.overallRate ?? 0}
        numerator={outcomes?.overallAligned ?? 0}
        denominator={outcomes?.overallTotal ?? 0}
        insufficient={outcomesInsufficient}
        highlighted
        onClick={() => openWithTab('outcomes')}
      />
    </div>
  )
}
