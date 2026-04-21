import type React from 'react'
import {
  User, MapPin, Phone, Mail, Facebook, GraduationCap, Award,
  Briefcase, Building2, BookOpen, BarChart3,
} from 'lucide-react'
import type { Alumni } from '../../../../shared/types/alumni.types'
import { PROGRAM_LABELS } from '../../alumni/-constants'
import { formatDate } from '../../../lib/formatters'

interface AlumniProfileCardProps {
  alumni: Alumni
}

/* ── Shared helpers ─────────────────────────────────────────────── */

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary" />
      <div>
        <p className="text-xs text-text-secondary">{label}</p>
        <p className="text-sm text-text-primary">{value}</p>
      </div>
    </div>
  )
}

function SectionCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-card-border bg-card p-6 shadow-sm ${className}`}>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">{title}</h3>
      {children}
    </div>
  )
}

function FullWidthRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="rounded-xl border border-card-border bg-card px-6 py-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{label}</p>
      <p className="mt-1 text-sm text-text-primary">{value || '—'}</p>
    </div>
  )
}

const COMPETENCY_LABELS: Record<string, string> = {
  comp_engineering_knowledge: 'Engineering Knowledge',
  comp_problem_solving: 'Problem Solving',
  comp_engineering_design: 'Engineering Design',
  comp_communication: 'Communication',
  comp_teamwork: 'Teamwork',
  comp_ethics: 'Ethics',
  comp_leadership: 'Leadership',
  comp_lifelong_learning: 'Lifelong Learning',
  comp_modern_tools: 'Modern Tools',
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
}

function getRatingColor(rating: number): string {
  if (rating >= 5) return 'bg-success/15 text-success'
  if (rating >= 4) return 'bg-success/10 text-success'
  if (rating >= 3) return 'bg-warning/15 text-warning'
  return 'bg-error/10 text-error'
}

/* ── Main component ─────────────────────────────────────────────── */

export function AlumniProfileCard({ alumni }: AlumniProfileCardProps) {
  const competencyKeys = Object.keys(COMPETENCY_LABELS) as (keyof Alumni)[]
  const competencyRatings = competencyKeys
    .map((key) => ({ key, label: COMPETENCY_LABELS[key as string], value: alumni[key] as number | null }))
    .filter((c) => c.value != null)

  const competencyAvg =
    competencyRatings.length > 0
      ? competencyRatings.reduce((sum, c) => sum + (c.value ?? 0), 0) / competencyRatings.length
      : null

  return (
    <div className="space-y-4">
      {/* ── 1. NAME + PROGRAM (half-width) ───────────────────────── */}
      <div className="w-full rounded-xl border border-card-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <User className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text-primary">{alumni.full_name}</h2>
            <p className="text-sm text-text-secondary">
              {PROGRAM_LABELS[alumni.program] ?? alumni.program} — Class of {alumni.year_graduated}
            </p>
            {alumni.has_honors === 1 && alumni.honors_received && (
              <p className="mt-1 flex items-center gap-1 text-xs text-warning">
                <Award className="h-3 w-3" />
                {alumni.honors_received}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. PERSONAL | ACADEMIC PROFILE (2-col) ──────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Personal">
          <div className="space-y-3">
            <InfoRow icon={User} label="Date of Birth" value={formatDate(alumni.date_of_birth)} />
            <InfoRow icon={User} label="Sex" value={alumni.sex_other || alumni.sex} />
            <InfoRow icon={MapPin} label="Address" value={alumni.permanent_address} />
            <InfoRow icon={Phone} label="Contact Number" value={alumni.contact_number} />
            <InfoRow icon={Mail} label="Gmail" value={alumni.gmail_address} />
            <InfoRow icon={Facebook} label="Facebook" value={alumni.facebook_link} />
          </div>
        </SectionCard>

        <SectionCard title="Academic Profile">
          <div className="space-y-3">
            <InfoRow icon={GraduationCap} label="Program" value={PROGRAM_LABELS[alumni.program] ?? alumni.program} />
            <InfoRow icon={GraduationCap} label="Year Graduated" value={String(alumni.year_graduated)} />
            <InfoRow icon={Award} label="Honors" value={alumni.has_honors === 1 ? (alumni.honors_received ?? 'Yes') : 'None'} />
          </div>
        </SectionCard>
      </div>

      {/* ── 3. LICENSURE & PROFESSIONAL QUALIFICATIONS | CAREER PROGRESSION | EMPLOYMENT DATA (2-col) ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className='flex flex-col gap-4'>
          <SectionCard title="Licensure & Professional Qualifications">
            <div className="space-y-3">
              <InfoRow icon={Award} label="Has License" value={alumni.has_license === 1 ? 'Yes' : alumni.has_license === 0 ? 'No' : null} />
              <InfoRow icon={Award} label="Professional Title" value={alumni.professional_title_other || alumni.professional_title} /> 
              <InfoRow icon={Award} label="License Exam Date" value={formatDate(alumni.license_exam_date)} />
              <InfoRow icon={Award} label="Other Certifications" value={alumni.other_certifications} />
              <InfoRow icon={GraduationCap} label="Has Graduate School" value={alumni.has_grad_school === 1 ? 'Yes' : alumni.has_grad_school === 0 ? 'No' : null} />
              <InfoRow icon={GraduationCap} label="Graduate Program" value={alumni.grad_school_program} />
              <InfoRow icon={BookOpen} label="Specialization" value={alumni.specialization} />
             
            </div>
          </SectionCard>

          <SectionCard title="Career Progression">
            <div className="space-y-3">
              <InfoRow icon={Briefcase} label="Position (6 yrs)" value={alumni.position_6yr} />
              <InfoRow icon={Briefcase} label="Position (4 yrs)" value={alumni.position_4yr} />
              <InfoRow icon={Briefcase} label="Position (2 yrs)" value={alumni.position_2yr} />
              <InfoRow icon={Award} label="Awards?" value={alumni.has_awards === 1 ? 'Yes' : alumni.has_awards === 0 ? 'No' : null} />
              <InfoRow icon={Award} label="Awards Received" value={alumni.awards_received} />
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Employment Data">
          <div className="space-y-3">
            <InfoRow icon={Briefcase} label="Employed" value={alumni.is_employed === 1 ? 'Yes' : alumni.is_employed === 0 ? 'No' : null} />
            <InfoRow icon={Briefcase} label="Unemployment Reason" value={alumni.unemployment_reason_other || alumni.unemployment_reason} />
            <InfoRow icon={Briefcase} label="Current Position" value={alumni.current_position} />
            <InfoRow icon={Briefcase} label="Job Level" value={alumni.job_level} />
            <InfoRow icon={Building2} label="Company Name" value={alumni.company_name} />
            <InfoRow icon={Building2} label="Company Address" value={alumni.company_address} />
            <InfoRow icon={Briefcase} label="Salary Range" value={alumni.salary_range} />
          </div>
        </SectionCard>
      </div>

      {/* ── 5. COMMUNITY INVOLVEMENT (full-width) ───────────────── */}
      <FullWidthRow label="Community Involvement" value={alumni.community_involvement} />

      {/* ── 6. RESEARCH AND PROJECTS (full-width) ───────────────── */}
      <FullWidthRow label="Research and Projects" value={alumni.research_conducted} />

      {/* ── 7. CURRICULUM | COMPETENCIES bulleted (2-col) ───────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Curriculum">
          <div className="space-y-3">
            <InfoRow
              icon={BookOpen}
              label="Curriculum Relevance"
              value={alumni.curriculum_relevance != null ? `${alumni.curriculum_relevance} / 5` : null}
            />
          </div>
        </SectionCard>

        <SectionCard title="Competencies">
          {competencyRatings.length > 0 ? (
            <ul className="space-y-2">
              {competencyRatings.map((c) => (
                <li key={c.key as string} className="flex items-center justify-between text-sm">
                  <span className="text-text-primary">{c.label}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getRatingColor(c.value!)}`}>
                    {c.value} — {RATING_LABELS[c.value!] ?? c.value}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-secondary">No competency ratings recorded</p>
          )}
        </SectionCard>
      </div>

      {/* ── 8. Q15: OPINION FOR IMPROVEMENTS (full-width) ───────── */}
      <FullWidthRow label="Q15: Opinion for Improvements" value={alumni.areas_to_improve} />

      {/* ── 9. PROFESSIONAL COMPETENCE (2×2 inner grid) ──────────── */}
      <SectionCard title="Professional Competence">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-card-border p-4">
            <p className="mb-1 text-xs font-medium text-text-secondary">Curriculum Relevance to Current Employment</p>
            <p className="text-sm text-text-primary">{alumni.job_relevance || '—'}</p>
          </div>
          <div className="rounded-lg border border-card-border p-4">
            <p className="mb-1 text-xs font-medium text-text-secondary">Reasons for Pursuing Advance Study</p>
            <p className="text-sm text-text-primary">{alumni.advanced_study_reason_other || alumni.advanced_study_reason || '—'}</p>
          </div>
        </div>
      </SectionCard>

      {/* ── 10. PERSONAL AND PROFESSIONAL UNDERTAKINGS (stacked) ─── */}
      <SectionCard title="Personal and Professional Undertakings">
        <div className="space-y-4">
          <div className="rounded-lg border border-card-border p-4">
            <p className="mb-2 text-xs font-medium text-text-secondary">Competencies Assessment</p>
            {competencyAvg != null ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="text-sm text-text-primary">
                    Weighted Mean: <strong>{competencyAvg.toFixed(2)}</strong> / 5
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getRatingColor(Math.round(competencyAvg))}`}>
                    {RATING_LABELS[Math.round(competencyAvg)] ?? '—'}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-surface-secondary">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${(competencyAvg / 5) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-secondary">No assessment data available</p>
            )}
          </div>

          <div className="rounded-lg border border-card-border p-4">
            <p className="mb-2 text-xs font-medium text-text-secondary">Competencies Learned</p>
            <p className="text-sm text-text-primary">
              {alumni.useful_competencies || '—'}
            </p>
            {alumni.useful_competencies_other && (
              <p className="mt-1 text-sm text-text-primary">
                <span className="text-text-secondary">Other:</span> {alumni.useful_competencies_other}
              </p>
            )}
          </div>
        </div>
      </SectionCard>

      {/* ── 11. CAREER PATH (mixed inner layout) ────────────────── */}
      <SectionCard title="Career Path">
        <div className="space-y-4">
          <div className="rounded-lg border border-card-border p-4">
            <p className="mb-1 text-xs font-medium text-text-secondary">Employment Status Distribution</p>
            <p className="text-sm text-text-primary">
              {alumni.employment_status_other || alumni.employment_status || '—'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-card-border p-4">
              <p className="mb-1 text-xs font-medium text-text-secondary">Work Assignment</p>
              <p className="text-sm text-text-primary">{alumni.work_region_other || alumni.work_region || '—'}</p>
            </div>
            <div className="rounded-lg border border-card-border p-4">
              <p className="mb-1 text-xs font-medium text-text-secondary">Industry Sector</p>
              <p className="text-sm text-text-primary">{alumni.industry_sector_other || alumni.industry_sector || '—'}</p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── 12–14. BOTTOM STANDALONE ROWS ────────────────────────── */}
      <FullWidthRow label="Time to First Job" value={alumni.time_to_first_job} />
      <FullWidthRow label="Method of Finding First Job" value={alumni.first_job_method_other || alumni.first_job_method} />
      <FullWidthRow
        label="Challenges Faced in Finding Employment"
        value={[alumni.job_challenges, alumni.job_challenges_other].filter(Boolean).join('; ') || null}
      />
    </div>
  )
}
