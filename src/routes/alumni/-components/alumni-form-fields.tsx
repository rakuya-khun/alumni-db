import type { UseFormReturn } from 'react-hook-form'
import type { AlumniFormData } from '../-schemas/alumni.schema'
import { CheckboxGroup } from './checkbox-group'
import {
  PROGRAMS, SEX_OPTIONS, EMPLOYMENT_STATUSES, JOB_RELEVANCE_OPTIONS,
  SALARY_RANGES, TIME_TO_FIRST_JOB, FIRST_JOB_METHODS, WORK_REGIONS,
  INDUSTRY_SECTORS_BY_PROGRAM, JOB_LEVEL_BY_PROGRAM,
  COMPETENCY_LABELS, LIKERT_LABELS,
  ADVANCED_STUDY_REASONS, UNEMPLOYMENT_REASONS, JOB_CHALLENGES,
  PROFESSIONAL_TITLES_BY_PROGRAM,
} from '../-constants'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const

function generateYearOptions() {
  const currentYear = new Date().getFullYear()
  const years: number[] = []
  for (let y = currentYear; y >= 2018; y--) years.push(y)
  return years
}

const YEAR_OPTIONS = generateYearOptions()

function generateExamYearOptions() {
  const currentYear = new Date().getFullYear()
  const years: number[] = []
  for (let y = currentYear; y >= 2010; y--) years.push(y)
  return years
}

const EXAM_YEAR_OPTIONS = generateExamYearOptions()

interface FieldProps {
  form: UseFormReturn<AlumniFormData>
  selectedProgram?: string
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs text-error">{message}</p> : null
}

function FormLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="mb-1 block text-sm font-medium text-text-primary">
      {label}
      {required && <span className="text-error"> *</span>}
    </label>
  )
}

// --- Section II: Respondent Info ---
export function RespondentInfoFields({ form }: FieldProps) {
  const { register, formState: { errors } } = form

  return (
    <fieldset className="space-y-4">
      <legend className="mb-3 text-base font-semibold text-text-primary">Section II: Respondent Information</legend>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <FormLabel label="Full Name" required />
          <input {...register('full_name')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          <FieldError message={errors.full_name?.message} />
        </div>
        <div>
          <FormLabel label="Date of Birth" />
          <input type="date" {...register('date_of_birth')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <FormLabel label="Sex" />
          <select {...register('sex')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none">
            <option value="">Select...</option>
            {SEX_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <FormLabel label="Sex (Other)" />
          <input {...register('sex_other')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div className="lg:col-span-2">
          <FormLabel label="Permanent Address" />
          <input {...register('permanent_address')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <FormLabel label="Contact Number" />
          <input {...register('contact_number')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <FormLabel label="Gmail Address" />
          <input type="email" {...register('gmail_address')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          <FieldError message={errors.gmail_address?.message} />
        </div>
        <div>
          <FormLabel label="Facebook Link" />
          <input {...register('facebook_link')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </div>
    </fieldset>
  )
}

// --- Section III: Academic Profile ---
export function AcademicProfileFields({ form }: FieldProps) {
  const { register, formState: { errors } } = form

  return (
    <fieldset className="space-y-4">
      <legend className="mb-3 text-base font-semibold text-text-primary">Section III: Academic Profile</legend>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <FormLabel label="Program" required />
          <select {...register('program')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none">
            <option value="">Select program...</option>
            {PROGRAMS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <FieldError message={errors.program?.message} />
        </div>
        <div>
          <FormLabel label="Year Graduated" required />
          <select {...register('year_graduated')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none">
            <option value="">Select year...</option>
            {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <FieldError message={errors.year_graduated?.message} />
        </div>
        <div>
          <FormLabel label="Graduated with Honors?" />
          <select {...register('has_honors')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none">
            <option value="">Select...</option>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>
        <div>
          <FormLabel label="Honors Received" />
          <input {...register('honors_received')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </div>
    </fieldset>
  )
}

// --- Section IV: Competencies & Curriculum ---
function LikertField({ form, name, label }: { form: UseFormReturn<AlumniFormData>; name: keyof AlumniFormData; label: string }) {
  const { register } = form
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-text-primary">{label}</span>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((v) => (
          <label key={v} className="flex items-center gap-1 text-xs text-text-secondary">
            <input type="radio" value={v} {...register(name)} className="accent-primary" />
            {v} - {LIKERT_LABELS[v]}
          </label>
        ))}
      </div>
    </div>
  )
}

export function CompetenciesFields({ form }: FieldProps) {
  const { register } = form

  return (
    <fieldset className="space-y-4">
      <legend className="mb-3 text-base font-semibold text-text-primary">Section IV: Curriculum & Competencies</legend>

      <LikertField form={form} name="curriculum_relevance" label="Relevance of Curriculum to Your Career" />

      <div className="mt-4 space-y-3">
        <p className="text-sm font-medium text-text-secondary">Rate the competencies you acquired:</p>
        {Object.entries(COMPETENCY_LABELS).map(([key, label]) => (
          <LikertField key={key} form={form} name={key as keyof AlumniFormData} label={label} />
        ))}
      </div>

      <div>
        <FormLabel label="Most Useful Competencies (comma-separated)" />
        <input {...register('useful_competencies')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>
      <div>
        <FormLabel label="Other Useful Competencies" />
        <input {...register('useful_competencies_other')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>
      <div>
        <FormLabel label="Areas to Improve" />
        <textarea {...register('areas_to_improve')} rows={3} className="w-full rounded-lg border border-card-border bg-surface-primary px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>
    </fieldset>
  )
}

// --- Section V: Licensure & Grad School ---
export function LicensureFields({ form, selectedProgram }: FieldProps) {
  const { register, watch, setValue } = form
  const hasLicense = watch('has_license')
  const hasGradSchool = watch('has_grad_school')
  const professionalTitles = selectedProgram ? PROFESSIONAL_TITLES_BY_PROGRAM[selectedProgram] ?? [] : []
  const examDate = (watch('license_exam_date') as string) ?? ''
  const [examMonth, examYear] = examDate ? examDate.split(' ') : ['', '']

  return (
    <fieldset className="space-y-4">
      <legend className="mb-3 text-base font-semibold text-text-primary">Section V: Licensure & Graduate Studies</legend>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <FormLabel label="Has Professional License/Certification?" />
          <select {...register('has_license')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none">
            <option value="">Select...</option>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>
        {Number(hasLicense) === 1 && (
          <>
            <div>
              <FormLabel label="Professional Title" />
              <select {...register('professional_title')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none">
                <option value="">Select title...</option>
                {professionalTitles.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {watch('professional_title') === 'Other' && (
              <div>
                <FormLabel label="Professional Title (Other)" />
                <input {...register('professional_title_other')} placeholder="Please specify..." className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            )}
            <div className="lg:col-span-2">
              <FormLabel label="License Exam Date" />
              <div className="flex gap-3">
                <select
                  value={examMonth}
                  onChange={(e) => {
                    const newMonth = e.target.value
                    const yr = examYear || ''
                    setValue('license_exam_date', newMonth && yr ? `${newMonth} ${yr}` : newMonth || yr || null, { shouldDirty: true })
                  }}
                  className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
                >
                  <option value="">Month...</option>
                  {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <select
                  value={examYear}
                  onChange={(e) => {
                    const newYear = e.target.value
                    const mo = examMonth || ''
                    setValue('license_exam_date', mo && newYear ? `${mo} ${newYear}` : mo || newYear || null, { shouldDirty: true })
                  }}
                  className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
                >
                  <option value="">Year...</option>
                  {EXAM_YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </>
        )}
        <div>
          <FormLabel label="Other Certifications" />
          <input {...register('other_certifications')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <FormLabel label="Pursued Graduate Studies?" />
          <select {...register('has_grad_school')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none">
            <option value="">Select...</option>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>
        {Number(hasGradSchool) === 1 && (
          <>
            <div>
              <FormLabel label="Graduate Program" />
              <input {...register('grad_school_program')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="lg:col-span-2">
              <CheckboxGroup
                form={form}
                name="advanced_study_reason"
                otherName="advanced_study_reason_other"
                label="Reason for Advanced Studies"
                options={ADVANCED_STUDY_REASONS}
              />
            </div>
            <div>
              <FormLabel label="Specialization" />
              <input {...register('specialization')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </>
        )}
      </div>
    </fieldset>
  )
}

// --- Section VI: Employment ---
export function EmploymentFields({ form, selectedProgram }: FieldProps) {
  const { register, watch } = form
  const isEmployed = watch('is_employed')
  const industrySectors = selectedProgram ? INDUSTRY_SECTORS_BY_PROGRAM[selectedProgram] ?? [] : []
  const jobLevels = selectedProgram ? JOB_LEVEL_BY_PROGRAM[selectedProgram] ?? [] : []

  return (
    <fieldset className="space-y-4">
      <legend className="mb-3 text-base font-semibold text-text-primary">Section VI: Employment Data</legend>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <FormLabel label="Currently Employed?" />
          <select {...register('is_employed')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none">
            <option value="">Select...</option>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>

        {Number(isEmployed) === 0 && (
          <div className="lg:col-span-2">
            <CheckboxGroup
              form={form}
              name="unemployment_reason"
              otherName="unemployment_reason_other"
              label="Reason for Unemployment"
              options={UNEMPLOYMENT_REASONS}
            />
          </div>
        )}

        {Number(isEmployed) === 1 && (
          <>
            <div>
              <FormLabel label="Employment Status" />
              <select {...register('employment_status')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none">
                <option value="">Select...</option>
                {EMPLOYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <FormLabel label="Current Position" />
              <input {...register('current_position')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <FormLabel label="Job Level" />
              <select {...register('job_level')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none">
                <option value="">Select...</option>
                {jobLevels.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <FormLabel label="Company Name" />
              <input {...register('company_name')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <FormLabel label="Company Address" />
              <input {...register('company_address')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <FormLabel label="Work Region" />
              <select {...register('work_region')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none">
                <option value="">Select...</option>
                {WORK_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <FormLabel label="Industry Sector" />
              <select {...register('industry_sector')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none">
                <option value="">Select...</option>
                {industrySectors.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <FormLabel label="Job Relevance to Degree" />
              <select {...register('job_relevance')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none">
                <option value="">Select...</option>
                {JOB_RELEVANCE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <FormLabel label="Salary Range" />
              <select {...register('salary_range')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none">
                <option value="">Select...</option>
                {SALARY_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </>
        )}

        <div>
          <FormLabel label="Time to First Job" />
          <select {...register('time_to_first_job')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none">
            <option value="">Select...</option>
            {TIME_TO_FIRST_JOB.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <FormLabel label="First Job Method" />
          <select {...register('first_job_method')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none">
            <option value="">Select...</option>
            {FIRST_JOB_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="lg:col-span-2">
          <CheckboxGroup
            form={form}
            name="job_challenges"
            otherName="job_challenges_other"
            label="Job Challenges"
            options={JOB_CHALLENGES}
          />
        </div>
      </div>
    </fieldset>
  )
}

// --- Section VII: Career Progression ---
export function CareerProgressionFields({ form }: FieldProps) {
  const { register } = form

  return (
    <fieldset className="space-y-4">
      <legend className="mb-3 text-base font-semibold text-text-primary">Section VII: Career Progression</legend>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div>
          <FormLabel label="Position After 2 Years" />
          <input {...register('position_2yr')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <FormLabel label="Position After 4 Years" />
          <input {...register('position_4yr')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <FormLabel label="Position After 6 Years" />
          <input {...register('position_6yr')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <FormLabel label="Has Awards/Recognition?" />
          <select {...register('has_awards')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none">
            <option value="">Select...</option>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>
        <div className="lg:col-span-2">
          <FormLabel label="Awards Received" />
          <input {...register('awards_received')} className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </div>
    </fieldset>
  )
}
