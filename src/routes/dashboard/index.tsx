import { useState, useRef, useEffect } from 'react'
import { Loader2, RefreshCw, Download, FileText, FileSpreadsheet } from 'lucide-react'
import { useAuth } from '../../hooks/use-auth'
import { useToast } from '../../hooks/use-toast'
import { ipcClient } from '../../data/ipc-client'
import { useDashboardStats } from './-hooks/use-dashboard-stats'
import { useSurveyAnalytics } from './-hooks/use-survey-analytics'
import { DashboardFilters, type DashboardFilterValues } from './-components/dashboard-filters'
import { TotalResponsesCard } from './-components/total-responses-card'
import { ProgramRespondentBoxes } from './-components/program-respondent-boxes'
import { BoardPassersCard } from './-components/board-passers-card'
import { EmployedCard } from './-components/employed-card'
import { FieldRelatedCard } from './-components/field-related-card'
import { SupervisoryCard } from './-components/supervisory-card'
import { CurriculumRelevanceTable } from './-components/curriculum-relevance-table'
import { CompetenciesTable } from './-components/competencies-table'
import { AdvanceStudiesTable } from './-components/advance-studies-table'
import { EmploymentStatusTable } from './-components/employment-status-table'
import { WorkAssignmentTable } from './-components/work-assignment-table'
import { IndustrySectorTable } from './-components/industry-sector-table'
import { FirstJobTable } from './-components/first-job-table'
import { ProgramDistChart } from './-components/program-dist-chart'
import { YearTrendChart } from './-components/year-trend-chart'
import { EmploymentChart } from './-components/employment-chart'
import { RecentActivity } from './-components/recent-activity'
import { ProfessionalTitleTable } from './-components/professional-title-table'
import { SpecializationTable } from './-components/specialization-table'
import { CompetenciesLearnedTable } from './-components/competencies-learned-table'
import { PeoCardsRow } from './-components/peo/peo-cards-row'
import { PeoAccordion } from './-components/peo/peo-accordion'
import { usePeo } from './-hooks/use-peo'
import type { PeoFilters } from '../../../shared/types/peo.types'

export default function DashboardPage() {
  const { fullName, role } = useAuth()
  const [dashFilters, setDashFilters] = useState<DashboardFilterValues>({
    programs: [],
    yearFrom: undefined,
    yearTo: undefined,
  })
  const [peoFilters, setPeoFilters] = useState<PeoFilters>({
    programs: undefined,
    yearFrom: undefined,
    yearTo: undefined,
    denominatorMode: 'total',
    asOfYear: undefined,
  })
  const { error: peoError } = usePeo(peoFilters)

  const extraFilters = {
    programs: dashFilters.programs.length > 0 ? dashFilters.programs : undefined,
    yearFrom: dashFilters.yearFrom,
    yearTo: dashFilters.yearTo,
  }

  const { stats, loading: statsLoading, refresh } = useDashboardStats(extraFilters)
  const { getTable, weightedMeans, loading: surveyLoading } = useSurveyAnalytics(extraFilters)
  const [exportOpen, setExportOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)
  const [peoExportOpen, setPeoExportOpen] = useState(false)
  const [peoExporting, setPeoExporting] = useState(false)
  const peoExportRef = useRef<HTMLDivElement>(null)
  const toast = useToast()

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false)
      }
      if (peoExportRef.current && !peoExportRef.current.contains(e.target as Node)) {
        setPeoExportOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])  // Surface PEO load errors as a non-blocking toast
  useEffect(() => {
    if (peoError) {
      toast.error('PEO data failed to load', peoError)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peoError])

  const handleDashboardExport = async (format: 'pdf' | 'docx') => {
    setExporting(true)
    setExportOpen(false)
    try {
      const filters = {
        programs: dashFilters.programs.length > 0 ? dashFilters.programs : undefined,
        yearFrom: dashFilters.yearFrom,
        yearTo: dashFilters.yearTo,
      }
      if (format === 'pdf') {
        await ipcClient.export.dashboardPdf(filters)
      } else {
        await ipcClient.export.dashboardDocx(filters)
      }
      toast.success('Export complete', 'Dashboard summary saved successfully')
    } catch (err) {
      toast.error('Export failed', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setExporting(false)
    }
  }

  const handlePeoExport = async (format: 'pdf' | 'docx') => {
    setPeoExporting(true)
    setPeoExportOpen(false)
    try {
      if (format === 'pdf') {
        await ipcClient.export.peoPdf(peoFilters)
      } else {
        await ipcClient.export.peoDocx(peoFilters)
      }
      toast.success('Export complete', 'PEO attainment report saved successfully')
    } catch (err) {
      toast.error('Export failed', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setPeoExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Welcome back, {fullName} — {role}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div ref={exportRef} className="relative">
            <button
              onClick={() => setExportOpen(!exportOpen)}
              disabled={exporting || statsLoading}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-card-border bg-card px-4 text-sm font-medium text-text-primary shadow-sm hover:bg-surface-secondary disabled:opacity-50"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export Dashboard
            </button>
            {exportOpen && (
              <div className="absolute right-0 z-10 mt-1 w-52 rounded-lg border border-card-border bg-card py-1 shadow-lg">
                <button
                  onClick={() => handleDashboardExport('pdf')}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface-secondary"
                >
                  <FileText className="h-4 w-4 text-error" />
                  Export as PDF
                </button>
                <button
                  onClick={() => handleDashboardExport('docx')}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface-secondary"
                >
                  <FileSpreadsheet className="h-4 w-4 text-info" />
                  Export as Word
                </button>
              </div>
            )}
          </div>
          <div ref={peoExportRef} className="relative">
            <button
              onClick={() => setPeoExportOpen(!peoExportOpen)}
              disabled={peoExporting}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-card-border bg-card px-4 text-sm font-medium text-text-primary shadow-sm hover:bg-surface-secondary disabled:opacity-50"
            >
              {peoExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export PEO
            </button>
            {peoExportOpen && (
              <div className="absolute right-0 z-10 mt-1 w-52 rounded-lg border border-card-border bg-card py-1 shadow-lg">
                <button
                  onClick={() => handlePeoExport('pdf')}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface-secondary"
                >
                  <FileText className="h-4 w-4 text-error" />
                  Export as PDF
                </button>
                <button
                  onClick={() => handlePeoExport('docx')}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface-secondary"
                >
                  <FileSpreadsheet className="h-4 w-4 text-info" />
                  Export as Word
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => refresh()}
            disabled={statsLoading}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-card-border bg-card px-4 text-sm font-medium text-text-primary shadow-sm hover:bg-surface-secondary disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* PEO Section */}
      <PeoCardsRow />
      <PeoAccordion peoFilters={peoFilters} onPeoFiltersChange={setPeoFilters} />

      {/* Dashboard Filters */}
      <DashboardFilters filters={dashFilters} onChange={setDashFilters} />

      {statsLoading && !stats ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-text-secondary">Loading dashboard data...</span>
        </div>
      ) : (
        <>
          {/* Row 1: Total + Program Counts */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <TotalResponsesCard total={stats?.totalCount ?? 0} />
            <ProgramRespondentBoxes countByProgram={stats?.countByProgram ?? []} />
          </div>

          {/* Row 2: KPI Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <BoardPassersCard
              data={stats?.boardPasserRate ?? { total: 0, passers: 0, rate: 0 }}
            />
            <EmployedCard
              data={stats?.employmentRate ?? { total: 0, employed: 0, rate: 0 }}
            />
            <FieldRelatedCard
              data={stats?.fieldRelatedRate ?? { employed: 0, fieldRelated: 0, rate: 0 }}
            />
            <SupervisoryCard
              data={stats?.supervisoryRate ?? { employed: 0, supervisory: 0, rate: 0 }}
            />
          </div>

          {/* Row 3: Program + Employment Charts */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ProgramDistChart data={stats?.countByProgram ?? []} />
            <EmploymentChart
              data={getTable('employment_status')?.rows ?? []}
            />
          </div>

          {/* Row 4: Year Trend Chart + Recent Activity */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <YearTrendChart data={stats?.countByYear ?? []} />
            </div>
            <RecentActivity />
          </div>

          {/* Survey Analysis Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-text-primary">Survey Analysis</h2>

            {/* PROFESSIONAL COMPETENCE */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-text-secondary uppercase tracking-wide">
                Professional Competence
              </h3>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <CurriculumRelevanceTable
                  data={getTable('curriculum_relevance')}
                  loading={surveyLoading}
                />
                <ProfessionalTitleTable
                  data={getTable('professional_title')}
                  loading={surveyLoading}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <AdvanceStudiesTable
                  data={getTable('advanced_study_reason')}
                  loading={surveyLoading}
                />
                <SpecializationTable
                  data={getTable('specialization')}
                  loading={surveyLoading}
                />
              </div>
            </div>

            {/* PERSONAL AND PROFESSIONAL UNDERTAKINGS */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-text-secondary uppercase tracking-wide">
                Personal and Professional Undertakings
              </h3>

              <CompetenciesTable
                data={getTable('competencies')}
                weightedMeans={weightedMeans}
                loading={surveyLoading}
              />

              <CompetenciesLearnedTable
                data={getTable('useful_competencies')}
                loading={surveyLoading}
              />
            </div>

            {/* CAREER PATH */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-text-secondary uppercase tracking-wide">
                Career Path
              </h3>

              <EmploymentStatusTable
                data={getTable('employment_status')}
                loading={surveyLoading}
              />

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <WorkAssignmentTable
                  data={getTable('work_region')}
                  loading={surveyLoading}
                />
                <IndustrySectorTable
                  data={getTable('industry_sector')}
                  loading={surveyLoading}
                />
              </div>

              <FirstJobTable
                timeData={getTable('time_to_first_job')}
                methodData={getTable('first_job_method')}
                challengesData={getTable('job_challenges')}
                loading={surveyLoading}
              />
            </div>
          </div>


        </>
      )}
    </div>
  )
}
