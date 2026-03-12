export type { Alumni, AlumniCreate, AlumniUpdate, AlumniFilters } from '../../shared/types/alumni.types'

export interface AlumniTableRow {
  id: number
  fullName: string
  program: string
  yearGraduated: number
  isEmployed: boolean
  hasLicense: boolean
  syncStatus: 'pending' | 'synced' | 'conflict'
}

export interface FilterState {
  programs: string[]
  yearFrom: number | null
  yearTo: number | null
  syncStatus: string | null
  isEmployed: number | null
  hasLicense: number | null
  search: string
}
