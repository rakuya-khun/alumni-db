import { useState, useCallback, useMemo, useEffect } from 'react'
import { ipcClient } from '../../../data/ipc-client'
import { useDebounce } from '../../../hooks/use-debounce'
import type { AlumniFilters } from '../../../../shared/types/alumni.types'

export function useAlumniFilters() {
  const [programs, setPrograms] = useState<string[]>([])
  const [yearFrom, setYearFrom] = useState<number | undefined>(undefined)
  const [yearTo, setYearTo] = useState<number | undefined>(undefined)
  const [syncStatus, setSyncStatus] = useState<string | undefined>(undefined)
  const [isEmployed, setIsEmployed] = useState<number | undefined>(undefined)
  const [hasLicense, setHasLicense] = useState<number | undefined>(undefined)
  const [searchInput, setSearchInput] = useState('')
  const [specialization, setSpecialization] = useState<string[]>([])
  const [workRegion, setWorkRegion] = useState<string[]>([])
  const [employmentPosition, setEmploymentPosition] = useState<string[]>([])

  // Dropdown values
  const [specializationOptions, setSpecializationOptions] = useState<string[]>([])
  const [workRegionOptions, setWorkRegionOptions] = useState<string[]>([])
  const [employmentPositionOptions, setEmploymentPositionOptions] = useState<string[]>([])

  // Fetch dropdown values on mount
  useEffect(() => {
    ipcClient.alumni.getSpecializations().then(setSpecializationOptions).catch(() => {})
    ipcClient.alumni.getWorkRegions().then(setWorkRegionOptions).catch(() => {})
    ipcClient.alumni.getEmploymentPositions().then(setEmploymentPositionOptions).catch(() => {})
  }, [])

  const debouncedSearch = useDebounce(searchInput, 300)

  const filters: AlumniFilters = useMemo(() => ({
    programs: programs.length > 0 ? programs : undefined,
    yearFrom,
    yearTo,
    syncStatus,
    isEmployed,
    hasLicense,
    search: debouncedSearch || undefined,
    specialization: specialization.length > 0 ? specialization : undefined,
    workRegion: workRegion.length > 0 ? workRegion : undefined,
    employmentPosition: employmentPosition.length > 0 ? employmentPosition : undefined,
  }), [programs, yearFrom, yearTo, syncStatus, isEmployed, hasLicense, debouncedSearch, specialization, workRegion, employmentPosition])

  const clearFilters = useCallback(() => {
    setPrograms([])
    setYearFrom(undefined)
    setYearTo(undefined)
    setSyncStatus(undefined)
    setIsEmployed(undefined)
    setHasLicense(undefined)
    setSearchInput('')
    setSpecialization([])
    setWorkRegion([])
    setEmploymentPosition([])
  }, [])

  const hasActiveFilters = useMemo(() => {
    return programs.length > 0 || yearFrom != null || yearTo != null ||
      syncStatus != null || isEmployed != null || hasLicense != null || searchInput !== '' ||
      specialization.length > 0 || workRegion.length > 0 || employmentPosition.length > 0
  }, [programs, yearFrom, yearTo, syncStatus, isEmployed, hasLicense, searchInput, specialization, workRegion, employmentPosition])

  return {
    filters,
    searchInput,
    setSearchInput,
    programs,
    setPrograms,
    yearFrom,
    setYearFrom,
    yearTo,
    setYearTo,
    syncStatus,
    setSyncStatus,
    isEmployed,
    setIsEmployed,
    hasLicense,
    setHasLicense,
    specialization,
    setSpecialization,
    specializationOptions,
    workRegion,
    setWorkRegion,
    workRegionOptions,
    employmentPosition,
    setEmploymentPosition,
    employmentPositionOptions,
    clearFilters,
    hasActiveFilters,
  }
}