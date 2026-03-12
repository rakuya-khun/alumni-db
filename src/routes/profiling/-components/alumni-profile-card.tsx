import { User, MapPin, Phone, Mail, Facebook, GraduationCap, Award, Briefcase, Building2 } from 'lucide-react'
import type { Alumni } from '../../../../shared/types/alumni.types'
import { PROGRAM_LABELS } from '../../alumni/-constants'
import { formatDate } from '../../../lib/formatters'

interface AlumniProfileCardProps {
  alumni: Alumni
}

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

export function AlumniProfileCard({ alumni }: AlumniProfileCardProps) {
  return (
    <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <User className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text-primary">{alumni.full_name}</h2>
          <p className="text-sm text-text-secondary">
            {PROGRAM_LABELS[alumni.program] ?? alumni.program}  Class of {alumni.year_graduated}
          </p>
          {alumni.has_honors === 1 && alumni.honors_received && (
            <p className="mt-1 flex items-center gap-1 text-xs text-warning">
              <Award className="h-3 w-3" />
              {alumni.honors_received}
            </p>
          )}
        </div>
      </div>

      {/* Section II: Respondent Information */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Personal</h3>
          <InfoRow icon={User} label="Date of Birth" value={formatDate(alumni.date_of_birth)} />
          <InfoRow icon={User} label="Sex" value={alumni.sex} />
          <InfoRow icon={User} label="Sex (Other)" value={alumni.sex_other} />
          <InfoRow icon={MapPin} label="Address" value={alumni.permanent_address} />
          <InfoRow icon={Phone} label="Contact" value={alumni.contact_number} />
          <InfoRow icon={Mail} label="Gmail" value={alumni.gmail_address} />
          <InfoRow icon={Facebook} label="Facebook" value={alumni.facebook_link} />
        </div>

        {/* Section III: Academic Profile */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Academic Profile</h3>
          <InfoRow icon={GraduationCap} label="Program" value={PROGRAM_LABELS[alumni.program] ?? alumni.program} />
          <InfoRow icon={GraduationCap} label="Year Graduated" value={String(alumni.year_graduated)} />
          <InfoRow icon={Award} label="Honors" value={alumni.has_honors === 1 ? alumni.honors_received : 'None'} />
        </div>
      </div>

      {/* Section IV: Curriculum & Competencies */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Curriculum & Competencies</h3>
          <InfoRow icon={GraduationCap} label="Curriculum Relevance" value={alumni.curriculum_relevance ? String(alumni.curriculum_relevance) : undefined} />
          <InfoRow icon={GraduationCap} label="Engineering Knowledge" value={alumni.comp_engineering_knowledge ? String(alumni.comp_engineering_knowledge) : undefined} />
          <InfoRow icon={GraduationCap} label="Problem Solving" value={alumni.comp_problem_solving ? String(alumni.comp_problem_solving) : undefined} />
          <InfoRow icon={GraduationCap} label="Engineering Design" value={alumni.comp_engineering_design ? String(alumni.comp_engineering_design) : undefined} />
          <InfoRow icon={GraduationCap} label="Communication" value={alumni.comp_communication ? String(alumni.comp_communication) : undefined} />
          <InfoRow icon={GraduationCap} label="Teamwork" value={alumni.comp_teamwork ? String(alumni.comp_teamwork) : undefined} />
          <InfoRow icon={GraduationCap} label="Ethics" value={alumni.comp_ethics ? String(alumni.comp_ethics) : undefined} />
          <InfoRow icon={GraduationCap} label="Leadership" value={alumni.comp_leadership ? String(alumni.comp_leadership) : undefined} />
          <InfoRow icon={GraduationCap} label="Lifelong Learning" value={alumni.comp_lifelong_learning ? String(alumni.comp_lifelong_learning) : undefined} />
          <InfoRow icon={GraduationCap} label="Modern Tools" value={alumni.comp_modern_tools ? String(alumni.comp_modern_tools) : undefined} />
          <InfoRow icon={GraduationCap} label="Useful Competencies" value={alumni.useful_competencies} />
          <InfoRow icon={GraduationCap} label="Other Useful Competencies" value={alumni.useful_competencies_other} />
          <InfoRow icon={GraduationCap} label="Areas to Improve" value={alumni.areas_to_improve} />
        </div>

        {/* Section V: Licensure & Professional Qualifications */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Licensure & Professional Qualifications</h3>
          <InfoRow icon={GraduationCap} label="Has License" value={alumni.has_license === 1 ? 'Yes' : 'No'} />
          <InfoRow icon={GraduationCap} label="Professional Title" value={alumni.professional_title} />
          <InfoRow icon={GraduationCap} label="Professional Title (Other)" value={alumni.professional_title_other} />
          <InfoRow icon={GraduationCap} label="Exam Date" value={formatDate(alumni.license_exam_date)} />
          <InfoRow icon={GraduationCap} label="Other Certifications" value={alumni.other_certifications} />
          <InfoRow icon={GraduationCap} label="Has Graduate School" value={alumni.has_grad_school === 1 ? 'Yes' : 'No'} />
          <InfoRow icon={GraduationCap} label="Grad School Program" value={alumni.grad_school_program} />
          <InfoRow icon={GraduationCap} label="Advanced Study Reason" value={alumni.advanced_study_reason} />
          <InfoRow icon={GraduationCap} label="Advanced Study Reason (Other)" value={alumni.advanced_study_reason_other} />
          <InfoRow icon={GraduationCap} label="Specialization" value={alumni.specialization} />
        </div>
      </div>

      {/* Section VI: Employment Data */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Employment Data</h3>
          <InfoRow icon={Briefcase} label="Employed" value={alumni.is_employed === 1 ? 'Yes' : 'No'} />
          <InfoRow icon={Briefcase} label="Unemployment Reason" value={alumni.unemployment_reason} />
          <InfoRow icon={Briefcase} label="Unemployment Reason (Other)" value={alumni.unemployment_reason_other} />
          <InfoRow icon={Briefcase} label="Employment Status" value={alumni.employment_status} />
          <InfoRow icon={Briefcase} label="Employment Status (Other)" value={alumni.employment_status_other} />
          <InfoRow icon={Briefcase} label="Current Position" value={alumni.current_position} />
          <InfoRow icon={Briefcase} label="Job Level" value={alumni.job_level} />
          <InfoRow icon={Building2} label="Company Name" value={alumni.company_name} />
          <InfoRow icon={Building2} label="Company Address" value={alumni.company_address} />
          <InfoRow icon={MapPin} label="Work Region" value={alumni.work_region} />
          <InfoRow icon={MapPin} label="Work Region (Other)" value={alumni.work_region_other} />
          <InfoRow icon={Briefcase} label="Industry Sector" value={alumni.industry_sector} />
          <InfoRow icon={Briefcase} label="Industry Sector (Other)" value={alumni.industry_sector_other} />
          <InfoRow icon={Briefcase} label="Job Relevance" value={alumni.job_relevance} />
          <InfoRow icon={Briefcase} label="Salary Range" value={alumni.salary_range} />
          <InfoRow icon={Briefcase} label="Time to First Job" value={alumni.time_to_first_job} />
          <InfoRow icon={Briefcase} label="First Job Method" value={alumni.first_job_method} />
          <InfoRow icon={Briefcase} label="First Job Method (Other)" value={alumni.first_job_method_other} />
          <InfoRow icon={Briefcase} label="Is First Job" value={alumni.is_first_job === 1 ? 'Yes' : 'No'} />
          <InfoRow icon={Briefcase} label="Job Challenges" value={alumni.job_challenges} />
          <InfoRow icon={Briefcase} label="Job Challenges (Other)" value={alumni.job_challenges_other} />
        </div>

        {/* Section V-B: Research & Projects */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Research & Projects</h3>
          <InfoRow icon={Briefcase} label="Research Conducted" value={alumni.research_conducted} />
        </div>
      </div>

      {/* Section VII: Career Progression & Community */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Career Progression</h3>
          <InfoRow icon={Briefcase} label="Position (2 yr)" value={alumni.position_2yr} />
          <InfoRow icon={Briefcase} label="Position (4 yr)" value={alumni.position_4yr} />
          <InfoRow icon={Briefcase} label="Position (6 yr)" value={alumni.position_6yr} />
          <InfoRow icon={Award} label="Has Awards" value={alumni.has_awards === 1 ? 'Yes' : 'No'} />
          <InfoRow icon={Award} label="Awards Received" value={alumni.awards_received} />
        </div>
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Community Involvement</h3>
          <InfoRow icon={Briefcase} label="Community Involvement" value={alumni.community_involvement} />
        </div>
      </div>
    </div>
  )
}
