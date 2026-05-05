import { useState, type ReactNode } from 'react'
import { ChevronDown, Info } from 'lucide-react'
import type { PeoTab } from '../../../../stores/peo.store'
import type { PeoRate, PeoOutcomeRates } from '../../../../../shared/types/peo.types'

interface Props {
  tab: PeoTab
  rate?: PeoRate
  outcomes?: PeoOutcomeRates
  asOfYear?: number
  denominatorMode?: 'total' | 'employed'
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{title}</h4>
      {children}
    </div>
  )
}

function Formula({ children }: { children: ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-md border border-card-border bg-surface-primary px-3 py-2 text-xs font-mono text-text-primary whitespace-pre-wrap">
      {children}
    </pre>
  )
}

function Criterion({ index, label, expr }: { index: number; label: string; expr: string }) {
  return (
    <div className="flex gap-2">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
        {index}
      </span>
      <div className="flex-1 space-y-0.5">
        <p className="text-sm text-text-primary">{label}</p>
        <code className="block text-[11px] font-mono text-text-secondary break-all">{expr}</code>
      </div>
    </div>
  )
}

function Paragraph({ children }: { children: ReactNode }) {
  return <p className="text-sm text-text-primary leading-relaxed">{children}</p>
}

interface PeoCopy {
  definition: string
  criteria: { label: string; expr: string }[]
  examples: { label: string; result: string }[]
}

const PEO_COPY: Record<'peo1' | 'peo2' | 'peo3', PeoCopy> = {
  peo1: {
    definition:
      'Measures whether alumni are practicing as competent engineers — employed in roles where their training is applied, credentialed, or trusted with leadership.',
    criteria: [
      {
        label: 'Job is highly or moderately related to course',
        expr: "LOWER(job_relevance) IN ('highly related','moderately related')",
      },
      {
        label: 'Holds a professional license OR other certification',
        expr: "has_license = 1 OR (other_certifications IS NOT NULL AND TRIM(other_certifications) != '')",
      },
      {
        label: 'Supervisory or managerial role',
        expr: "LOWER(job_level) LIKE '%supervisory%' OR LOWER(job_level) LIKE '%managerial%' OR LOWER(job_level) LIKE '%team lead%' OR LOWER(job_level) = 'yes'",
      },
    ],
    examples: [
      {
        label:
          "Alumna A: is_employed=1, job_relevance='Highly related', has_license=0, job_level='Entry level'",
        result: 'criterion 1 ✓ → PEO 1 attained',
      },
      {
        label:
          "Alumna B: is_employed=1, job_relevance='Not related', has_license=0, job_level='Supervisory'",
        result: 'criterion 3 ✓ → PEO 1 attained',
      },
      {
        label: 'Alumno C: is_employed=0',
        result: 'fails employment gate → not attained',
      },
    ],
  },
  peo2: {
    definition:
      'Measures whether alumni demonstrate civic responsibility — through community involvement, public-service employment, recognition, or service-oriented roles.',
    criteria: [
      {
        label: 'Job is highly or moderately related to course',
        expr: "LOWER(job_relevance) IN ('highly related','moderately related')",
      },
      {
        label: 'Reported community involvement (direct field)',
        expr: "community_involvement IS NOT NULL AND TRIM(community_involvement) != ''",
      },
      {
        label: 'Works in a public-service sector',
        expr: "LOWER(industry_sector) OR LOWER(industry_sector_other) LIKE any of: %government%, %public sector%, %public service%, %public works%, %lgu%, %academe%, %academic%, %university%, %education%, %school%, %research%",
      },
      {
        label:
          'Position keyword match (community/extension/volunteer/outreach/NGO/barangay/welfare/public service/social worker)',
        expr:
          "LOWER(current_position) LIKE any of: %community%, %extension%, %volunteer%, %outreach%, %ngo%, %barangay%, %welfare%, %public service%, %social worker%",
      },
      { label: 'Has awards or recognition', expr: 'has_awards = 1' },
    ],
    examples: [
      {
        label:
          "Alumna D: is_employed=1, community_involvement='Barangay youth program'",
        result: 'criterion 2 ✓ (direct field) → PEO 2 attained',
      },
      {
        label:
          "Alumno E: is_employed=1, community_involvement=NULL, current_position='Outreach coordinator'",
        result: 'criterion 4 ✓ (proxy keyword) → PEO 2 attained',
      },
      {
        label: 'Alumna F: is_employed=0, has_awards=1',
        result: 'fails employment gate → not attained (awards alone insufficient)',
      },
    ],
  },
  peo3: {
    definition:
      'Measures whether alumni engage in lifelong learning and innovation — through research activity, graduate study, or work in research/innovation sectors.',
    criteria: [
      {
        label: 'Job is highly or moderately related to course',
        expr: "LOWER(job_relevance) IN ('highly related','moderately related')",
      },
      {
        label: 'Reported research conducted (direct field)',
        expr: "research_conducted IS NOT NULL AND TRIM(research_conducted) != ''",
      },
      { label: 'Pursued graduate school', expr: 'has_grad_school = 1' },
      {
        label: 'Advanced study driven by research interest',
        expr: "advanced_study_reason LIKE '%Research interest%'",
      },
      {
        label:
          'Position keyword match (research/R&D/scientist/professor/laboratory/data scientist/innovation)',
        expr:
          "LOWER(current_position) LIKE '%research%' OR LIKE '%r&d%' OR LIKE '%scientist%' OR LIKE '%professor%' OR LIKE '%laboratory%' OR LIKE '%data scientist%' OR LIKE '%innovation%'",
      },
      {
        label: "Innovation / tech sector for the alumnus's program (per-program allowlist)",
        expr:
          "BSCE: industry_sector OR industry_sector_other LIKE any of %consulting%, %construction%, %infrastructure%, %academe%, %research%, %education%, %school%; BSCpE: %information technology%, %software%, %telecom%, %semiconductor%, %electronics%, %cyber%, %fintech%, %insurtech%, %devops%, %qa%, %hardware%, %iot%, %networking%, %it consulting%, %systems integration%, %data%, %ai%, %cloud%, %automotive%, %education%, %school%; BSEE: %power%, %energy%, %renewable%, %telecom%, %semiconductor%, %electronics%, %academe%, %research%, %education%, %school%",
      },
    ],
    examples: [
      {
        label:
          "Alumno G: is_employed=1, research_conducted='Smart-grid load forecasting study'",
        result: 'criterion 2 ✓ (direct field) → PEO 3 attained',
      },
      {
        label:
          "Alumna H: is_employed=1, has_grad_school=0, current_position='Research Engineer'",
        result: 'criterion 5 ✓ (proxy keyword) → PEO 3 attained',
      },
      {
        label: 'Alumno I: is_employed=0, has_grad_school=1',
        result: 'fails employment gate → not attained',
      },
    ],
  },
}

function PeoBody({
  tab,
  rate,
  denominatorMode,
}: {
  tab: 'peo1' | 'peo2' | 'peo3'
  rate?: PeoRate
  denominatorMode: 'total' | 'employed'
}) {
  const copy = PEO_COPY[tab]
  return (
    <div className="space-y-4">
      <Section title="Plain-English definition">
        <Paragraph>{copy.definition}</Paragraph>
      </Section>

      <Section title="Formula">
        <Formula>
          {`attainment % = (passing alumni ÷ denominator) × 100
passing alumni = COUNT( employed AND any of the criteria below )`}
        </Formula>
        {rate && (
          <Formula>
            {`Current scope:
  passing  = ${rate.passing}
  denom    = ${rate.denominator}
  %        = ${rate.rate.toFixed(2)}%${rate.insufficient ? '   ⚠ insufficient (n<10)' : ''}`}
          </Formula>
        )}
      </Section>

      <Section title="Pass criteria (logical OR after employment gate)">
        <div className="space-y-2">
          {copy.criteria.map((c, i) => (
            <Criterion key={i} index={i + 1} label={c.label} expr={c.expr} />
          ))}
        </div>
      </Section>

      <Section title="Employment gate">
        <Paragraph>
          The employment gate is evaluated <em>before</em> the OR-criteria. Unemployed alumni
          cannot attain any PEO regardless of other fields.
        </Paragraph>
        <Formula>{`is_employed = 1   -- required precondition`}</Formula>
      </Section>

      <Section title="Denominator">
        <Paragraph>
          Two denominator modes are supported. Active mode:{' '}
          <span className="font-bold text-primary">{denominatorMode}</span>
        </Paragraph>
        <Formula>
          {`Total respondents in scope (default):
  denominator = COUNT(*) FROM alumni WHERE <filters>

Employed only:
  denominator = COUNT(*) FROM alumni WHERE is_employed = 1 AND <filters>`}
        </Formula>
      </Section>

      <Section title="Insufficient-data threshold">
        <Paragraph>
          When the denominator is less than 10, the percentage is still shown but is flagged with a
          yellow <code className="rounded bg-warning/10 px-1 text-warning">Insufficient data (n=X)</code>{' '}
          badge. Tiny samples produce statistically unreliable headline numbers and should not be
          used for accreditation reporting on their own.
        </Paragraph>
      </Section>

      <Section title="Worked example">
        <div className="space-y-2 rounded-md border border-card-border bg-surface-primary p-3">
          {copy.examples.map((ex, i) => (
            <div key={i} className="text-xs leading-relaxed">
              <p className="text-text-primary">{ex.label}</p>
              <p className="mt-0.5 font-semibold text-text-secondary">→ {ex.result}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Filters that affect this number">
        <ul className="list-disc space-y-1 pl-5 text-sm text-text-primary">
          <li>Selected programs (BSCE / BSCpE / BSEE)</li>
          <li>Year-graduated range (schema floor: 2018)</li>
          <li>Denominator mode (total vs employed)</li>
          <li>
            <span className="font-semibold">Role-based scope (RBAC):</span> Chairs see only their
            own program; the Dean sees all programs.
          </li>
        </ul>
      </Section>
    </div>
  )
}

function OutcomesBody({
  outcomes,
  asOfYear,
}: {
  outcomes?: PeoOutcomeRates
  asOfYear?: number
}) {
  const Y = asOfYear ?? new Date().getFullYear()
  return (
    <div className="space-y-4">
      <Section title="Definition">
        <Paragraph>
          An alumnus is <em>aligned</em> when employed AND their job is highly or moderately related
          to their degree. Cohorts split alumni by years since graduation.
        </Paragraph>
      </Section>

      <Section title="Formula">
        <Formula>
          {`aligned   = is_employed = 1 AND LOWER(job_relevance) IN ('highly related','moderately related')
rate %    = (aligned ÷ total) × 100   per cohort`}
        </Formula>
        {outcomes && (
          <Formula>
            {`Current scope (overall):
  aligned = ${outcomes.overallAligned}
  total   = ${outcomes.overallTotal}
  %       = ${outcomes.overallRate.toFixed(2)}%`}
          </Formula>
        )}
      </Section>

      <Section title="Cohort cutoffs">
        <Formula>
          {`Y = ${Y}
Recent      : year_graduated >= ${Y - 2}            (0–2 years)
Mid-career  : year_graduated BETWEEN ${Y - 5} AND ${Y - 3}  (3–5 years)
Established : year_graduated BETWEEN 2018 AND ${Y - 6}     (6+ years, schema floor 2018)`}
        </Formula>
      </Section>

      {outcomes && (
        <Section title="Per-cohort current numbers">
          <Formula>
            {`Recent      : ${outcomes.cohorts.recent.aligned} / ${outcomes.cohorts.recent.total}  →  ${outcomes.cohorts.recent.rate.toFixed(2)}%${outcomes.cohorts.recent.insufficient ? '  ⚠' : ''}
Mid-career  : ${outcomes.cohorts.mid.aligned} / ${outcomes.cohorts.mid.total}  →  ${outcomes.cohorts.mid.rate.toFixed(2)}%${outcomes.cohorts.mid.insufficient ? '  ⚠' : ''}
Established : ${outcomes.cohorts.established.aligned} / ${outcomes.cohorts.established.total}  →  ${outcomes.cohorts.established.rate.toFixed(2)}%${outcomes.cohorts.established.insufficient ? '  ⚠' : ''}`}
          </Formula>
        </Section>
      )}

      <Section title="Insufficient-data threshold">
        <Paragraph>
          When a cohort's total is less than 10, the rate is still shown but flagged with a yellow{' '}
          <code className="rounded bg-warning/10 px-1 text-warning">Insufficient data (n=X)</code>{' '}
          badge. Small cohorts produce unreliable percentages.
        </Paragraph>
      </Section>

      <Section title="Filters that affect these numbers">
        <ul className="list-disc space-y-1 pl-5 text-sm text-text-primary">
          <li>Selected programs (BSCE / BSCpE / BSEE)</li>
          <li>Year-graduated range</li>
          <li>As-of-year (drives cohort cutoffs)</li>
          <li>
            <span className="font-semibold">Role-based scope (RBAC):</span> Chairs see only their
            own program; the Dean sees all programs.
          </li>
        </ul>
      </Section>
    </div>
  )
}

export function ProcessingLogic({ tab, rate, outcomes, asOfYear, denominatorMode = 'total' }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-lg border border-card-border bg-surface-secondary">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-text-primary hover:bg-surface-tertiary transition-colors"
      >
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-text-secondary" />
          <span>How this is calculated</span>
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
          {tab === 'outcomes' ? (
            <OutcomesBody outcomes={outcomes} asOfYear={asOfYear} />
          ) : (
            <PeoBody tab={tab} rate={rate} denominatorMode={denominatorMode} />
          )}
        </div>
      </div>
    </div>
  )
}
