import { Loader2, RefreshCw } from 'lucide-react'
import { useAuth } from '../../hooks/use-auth'
import { useDashboardStats } from './-hooks/use-dashboard-stats'
import { useSurveyAnalytics } from './-hooks/use-survey-analytics'
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

export default function DashboardPage() {
  const { fullName, role } = useAuth()
  const { stats, loading: statsLoading, refresh } = useDashboardStats()
  const { getTable, weightedMeans, loading: surveyLoading } = useSurveyAnalytics()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Welcome back, {fullName} — {role}
          </p>
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

          {/* Row 5: Survey Tables */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">Survey Analysis</h2>

            <CurriculumRelevanceTable
              data={getTable('curriculum_relevance')}
              loading={surveyLoading}
            />

            <CompetenciesTable
              data={getTable('competencies')}
              weightedMeans={weightedMeans}
              loading={surveyLoading}
            />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <AdvanceStudiesTable
                data={getTable('advanced_study_reason')}
                loading={surveyLoading}
              />
              <EmploymentStatusTable
                data={getTable('employment_status')}
                loading={surveyLoading}
              />
            </div>

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


        </>
      )}
    </div>
  )
}
