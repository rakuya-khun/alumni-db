import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react'
import { AlumniProfileCard } from './-components/alumni-profile-card'
import { DisplayViewTabs } from './-components/display-view-tabs'
import { FullHistoryView } from './-components/full-history-view'
import { LatestUpdatesView } from './-components/latest-updates-view'
import { AlumniHistoryTimeline } from './-components/alumni-history-timeline'
import { useAlumniProfile } from './-hooks/use-alumni-profile'
import { useAlumniHistory } from './-hooks/use-alumni-history'
import { useProfilingStore } from '../../stores/profiling.store'

export default function ProfileDetailPage() {
  const { id } = useParams<{ id: string }>()
  const numericId = id ? Number(id) : undefined
  const { profile, history, loading, error, isAccessible } = useAlumniProfile(numericId)
  const { displayMode, setDisplayMode } = useProfilingStore()
  const { sorted, diffsPerEntry, latest } = useAlumniHistory(history)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="space-y-4">
        <Link to="/profiling" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Profiling
        </Link>
        <div className="rounded-xl border border-error/30 bg-error/5 p-8 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-error" />
          <p className="mt-3 text-text-primary">{error ?? 'Alumni record not found'}</p>
        </div>
      </div>
    )
  }

  if (!isAccessible) {
    return (
      <div className="space-y-4">
        <Link to="/profiling" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Profiling
        </Link>
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-8 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-warning" />
          <p className="mt-3 text-text-primary">You do not have access to this alumni&apos;s program.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link to="/profiling" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to Profiling
      </Link>

      <AlumniProfileCard alumni={profile} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Update History</h2>
          <span className="text-sm text-text-secondary">
            {sorted.length} update{sorted.length !== 1 ? 's' : ''} recorded
          </span>
        </div>

        <DisplayViewTabs current={displayMode} onChange={setDisplayMode} />

        {displayMode === 'history' && (
          <FullHistoryView entries={sorted} diffsPerEntry={diffsPerEntry} />
        )}
        {displayMode === 'latest' && (
          <LatestUpdatesView
            latest={latest}
            diffs={latest ? (diffsPerEntry.get(latest.id) ?? []) : []}
          />
        )}
        {displayMode === 'timeline' && (
          <AlumniHistoryTimeline entries={sorted} diffsPerEntry={diffsPerEntry} />
        )}
      </div>
    </div>
  )
}
