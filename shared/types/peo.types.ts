/**
 * Program Educational Objectives (PEO) shared types.
 * Used by both main process (services/ipc) and renderer (UI).
 * See docs/PEO-IMPLEMENTATION-PLAN.md §3-§5.
 */

export type Cohort = 'recent' | 'mid' | 'established'

export type DenominatorMode = 'total' | 'employed'

export interface PeoFilters {
  programs?: string[]
  yearFrom?: number
  yearTo?: number
  denominatorMode?: DenominatorMode
  asOfYear?: number
}

export type PeoIndicatorBreakdown = Record<string, { count: number; label: string }>

export interface PeoRate {
  passing: number
  denominator: number
  rate: number
  insufficient: boolean
  indicators: PeoIndicatorBreakdown
}

export interface PeoResult {
  peo1: PeoRate
  peo2: PeoRate
  peo3: PeoRate
  denominator: number
  asOfYear: number
  denominatorMode: DenominatorMode
}

export interface PeoCohortRate {
  cohort: Cohort
  total: number
  aligned: number
  rate: number
  insufficient: boolean
}

export interface PeoOutcomeRates {
  cohorts: {
    recent: PeoCohortRate
    mid: PeoCohortRate
    established: PeoCohortRate
  }
  overallAligned: number
  overallTotal: number
  overallRate: number
  asOfYear: number
}
