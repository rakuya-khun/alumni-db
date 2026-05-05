import { peoRepository } from '../database/peo.repository'
import { peoFiltersSchema } from '../../shared/schemas/peo.schema'
import type {
  PeoFilters,
  PeoResult,
  PeoRate,
  PeoOutcomeRates,
  PeoCohortRate,
  PeoIndicatorBreakdown,
  Cohort,
} from '../../shared/types/peo.types'

const INSUFFICIENT_THRESHOLD = 10

function pct(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0
  return Math.round((numerator / denominator) * 10000) / 100
}

function buildIndicators(
  source: Record<string, number>,
  spec: Array<{ key: string; label: string }>
): PeoIndicatorBreakdown {
  const out: PeoIndicatorBreakdown = {}
  for (const { key, label } of spec) {
    out[key] = { count: source[key] ?? 0, label }
  }
  return out
}

const PEO1_INDICATORS = [
  { key: 'jobRelated', label: 'Job-related employment' },
  { key: 'license', label: 'Has license / certification' },
  { key: 'supervisory', label: 'Supervisory or Managerial role' },
]

const PEO2_INDICATORS = [
  { key: 'jobRelated', label: 'Job-related employment' },
  { key: 'communityDirect', label: 'Community involvement (reported)' },
  { key: 'communityProxySector', label: 'Public-service sector' },
  { key: 'communityProxyKeyword', label: 'Position keyword match' },
  { key: 'hasAwards', label: 'Has awards or recognition' },
]

const PEO3_INDICATORS = [
  { key: 'jobRelated', label: 'Job-related employment' },
  { key: 'researchDirect', label: 'Research conducted (reported)' },
  { key: 'researchGradSchool', label: 'Pursued graduate school' },
  { key: 'researchAdvancedReason', label: 'Advanced study for research' },
  { key: 'researchProxyKeyword', label: 'Position keyword match' },
  { key: 'innovationSector', label: 'Innovation / tech sector' },
]

export const peoService = {
  compute(rawFilters?: PeoFilters): PeoResult {
    const filters = peoFiltersSchema.parse(rawFilters ?? {}) as PeoFilters
    const asOfYear = filters.asOfYear ?? new Date().getFullYear()
    const denominatorMode = filters.denominatorMode ?? 'total'

    const counts = peoRepository.computePeoCounts(filters)
    const effectiveDenom =
      denominatorMode === 'employed' ? counts.employed : counts.denominator

    const indicatorSource = counts.indicators as unknown as Record<string, number>

    const buildRate = (
      passing: number,
      spec: Array<{ key: string; label: string }>
    ): PeoRate => ({
      passing,
      denominator: effectiveDenom,
      rate: pct(passing, effectiveDenom),
      insufficient: effectiveDenom < INSUFFICIENT_THRESHOLD,
      indicators: buildIndicators(indicatorSource, spec),
    })

    return {
      peo1: buildRate(counts.peo1Passing, PEO1_INDICATORS),
      peo2: buildRate(counts.peo2Passing, PEO2_INDICATORS),
      peo3: buildRate(counts.peo3Passing, PEO3_INDICATORS),
      denominator: effectiveDenom,
      asOfYear,
      denominatorMode,
    }
  },

  getOutcomeRates(rawFilters?: PeoFilters): PeoOutcomeRates {
    const filters = peoFiltersSchema.parse(rawFilters ?? {}) as PeoFilters
    const asOfYear = filters.asOfYear ?? new Date().getFullYear()

    const counts = peoRepository.computeOutcomeRates(filters, asOfYear)

    const buildCohort = (
      cohort: Cohort,
      total: number,
      aligned: number
    ): PeoCohortRate => ({
      cohort,
      total,
      aligned,
      rate: pct(aligned, total),
      insufficient: total < INSUFFICIENT_THRESHOLD,
    })

    return {
      cohorts: {
        recent: buildCohort('recent', counts.cohorts.recent.total, counts.cohorts.recent.aligned),
        mid: buildCohort('mid', counts.cohorts.mid.total, counts.cohorts.mid.aligned),
        established: buildCohort(
          'established',
          counts.cohorts.established.total,
          counts.cohorts.established.aligned
        ),
      },
      overallAligned: counts.overallAligned,
      overallTotal: counts.overallTotal,
      overallRate: pct(counts.overallAligned, counts.overallTotal),
      asOfYear,
    }
  },
}
