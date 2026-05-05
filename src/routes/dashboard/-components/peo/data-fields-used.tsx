import { useState } from 'react'
import { ChevronDown, Database } from 'lucide-react'
import type { PeoTab } from '../../../../stores/peo.store'

interface FieldInfo {
  name: string
  type: string
  purpose: string
}

const FIELD_INFO_BY_TAB: Record<PeoTab, FieldInfo[]> = {
  peo1: [
    { name: 'is_employed', type: 'INTEGER (0/1)', purpose: 'Employment gate — required for any PEO' },
    {
      name: 'job_relevance',
      type: 'TEXT',
      purpose: "'Highly related' or 'Moderately related' satisfies criterion 1",
    },
    {
      name: 'has_license',
      type: 'INTEGER (0/1)',
      purpose: 'PRC board/professional license — satisfies criterion 2',
    },
    {
      name: 'other_certifications',
      type: 'TEXT',
      purpose: 'Non-empty alternative path to criterion 2',
    },
    {
      name: 'job_level',
      type: 'TEXT',
      purpose: 'Supervisory/Managerial values satisfy criterion 3',
    },
  ],
  peo2: [
    { name: 'is_employed', type: 'INTEGER (0/1)', purpose: 'Employment gate' },
    { name: 'job_relevance', type: 'TEXT', purpose: 'Job-related criterion' },
    {
      name: 'community_involvement',
      type: 'TEXT',
      purpose: 'Direct field — non-empty satisfies community criterion',
    },
    {
      name: 'industry_sector',
      type: 'TEXT',
      purpose: 'Public-service sectors satisfy proxy criterion',
    },
    {
      name: 'industry_sector_other',
      type: 'TEXT',
      purpose: "Free-text fallback when 'Other' is selected — also scanned for keywords",
    },
    {
      name: 'current_position',
      type: 'TEXT',
      purpose: 'Keyword scan (community/extension/volunteer/etc.) — proxy criterion',
    },
    { name: 'has_awards', type: 'INTEGER (0/1)', purpose: 'Awards/recognition criterion' },
  ],
  peo3: [
    { name: 'is_employed', type: 'INTEGER (0/1)', purpose: 'Employment gate' },
    { name: 'job_relevance', type: 'TEXT', purpose: 'Job-related criterion' },
    {
      name: 'research_conducted',
      type: 'TEXT',
      purpose: 'Direct field — non-empty satisfies research criterion',
    },
    { name: 'has_grad_school', type: 'INTEGER (0/1)', purpose: 'Pursued graduate study' },
    {
      name: 'advanced_study_reason',
      type: 'TEXT',
      purpose: "LOWER(...) LIKE '%research interest%' — proxy",
    },
    {
      name: 'current_position',
      type: 'TEXT',
      purpose: 'Keyword scan (research/scientist/etc.) — proxy',
    },
    {
      name: 'industry_sector',
      type: 'TEXT',
      purpose: 'Innovation/tech sector — per-program allowlist',
    },
    {
      name: 'industry_sector_other',
      type: 'TEXT',
      purpose: "Free-text fallback when 'Other' is selected — also scanned for keywords",
    },
    {
      name: 'program',
      type: 'TEXT',
      purpose: 'Drives per-program sector allowlist for criterion 6',
    },
  ],
  outcomes: [
    { name: 'is_employed', type: 'INTEGER (0/1)', purpose: 'Required for "aligned" status' },
    { name: 'job_relevance', type: 'TEXT', purpose: 'Highly/Moderately related = aligned' },
    {
      name: 'year_graduated',
      type: 'INTEGER',
      purpose: 'Drives cohort assignment relative to as-of-year',
    },
  ],
}

export function DataFieldsUsed({ tab }: { tab: PeoTab }) {
  const [open, setOpen] = useState(false)
  const fields = FIELD_INFO_BY_TAB[tab]

  return (
    <div className="rounded-lg border border-card-border bg-surface-secondary">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-text-primary hover:bg-surface-tertiary transition-colors"
      >
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-text-secondary" />
          <span>Data fields used ({fields.length})</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-text-secondary transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          open ? 'max-h-[2400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-card-border px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fields.map((f) => (
              <div
                key={f.name}
                className="rounded-md border border-card-border bg-surface-primary p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <code className="text-xs font-mono font-semibold text-text-primary">
                    {f.name}
                  </code>
                  <span className="text-[10px] uppercase tracking-wide text-text-muted">
                    {f.type}
                  </span>
                </div>
                <p className="mt-1 text-xs text-text-secondary leading-relaxed">{f.purpose}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
