import { alumniRepository, type AlumniFilters, type AlumniRow } from '../database/alumni.repository'
import { alumniHistoryRepository } from '../database/alumni-history.repository'
import { safeSave } from '../database/db-manager'
import { MIN_GRADUATION_YEAR } from '../config/constants'
import { logger } from '../utils/logger'

function validateGraduationYear(year: number): void {
  if (year < MIN_GRADUATION_YEAR) {
    throw new Error(
      `Year graduated must be ${MIN_GRADUATION_YEAR} or later. Received: ${year}`
    )
  }
}

export const alumniService = {
    async getDistinctSpecializations(): Promise<string[]> {
      return alumniRepository.getDistinctSpecializations()
    },

    async getDistinctWorkRegions(): Promise<string[]> {
      return alumniRepository.getDistinctWorkRegions()
    },

    async getDistinctEmploymentPositions(): Promise<string[]> {
      return alumniRepository.getDistinctEmploymentPositions()
    },
  async getAll(filters?: Record<string, unknown>): Promise<AlumniRow[]> {
    const parsed = filters as AlumniFilters | undefined
    return alumniRepository.getAll(parsed ?? {})
  },

  async getById(id: number): Promise<AlumniRow | null> {
    return alumniRepository.getById(id)
  },

  async create(data: Record<string, unknown>): Promise<number> {
    const year = data.year_graduated as number
    if (year != null) validateGraduationYear(year)

    // Check for duplicate by composite key
    const existing = alumniRepository.findByCompositeKey(
      data.full_name as string,
      data.program as string,
      year
    )
    if (existing) {
      throw new Error(
        `An alumni record already exists for ${data.full_name} (${data.program}, ${year}).`
      )
    }

    const id = alumniRepository.create(data)
    safeSave()
    logger.info('alumni', `Created alumni #${id}: ${data.full_name}`)
    return id
  },

  async update(id: number, data: Record<string, unknown>): Promise<void> {
    if (data.year_graduated != null) {
      validateGraduationYear(data.year_graduated as number)
    }

    // Snapshot current state before updating
    const current = alumniRepository.getById(id)
    if (!current) {
      throw new Error(`Alumni record #${id} not found.`)
    }

    // Compute changed fields
    const changedFields: string[] = []
    for (const key of Object.keys(data)) {
      if (data[key] !== current[key]) {
        changedFields.push(key)
      }
    }

    if (changedFields.length === 0) {
      logger.info('alumni', `Update skipped for #${id}: no changes detected`)
      return
    }

    // Create history snapshot
    alumniHistoryRepository.createSnapshot(
      id,
      JSON.stringify(current),
      JSON.stringify(changedFields)
    )

    // Apply update
    alumniRepository.update(id, data)
    safeSave()
    logger.info('alumni', `Updated alumni #${id}, changed: ${changedFields.join(', ')}`)
  },

  async delete(id: number): Promise<void> {
    const existing = alumniRepository.getById(id)
    if (!existing) {
      throw new Error(`Alumni record #${id} not found.`)
    }
    alumniRepository.delete(id)
    safeSave()
    logger.info('alumni', `Deleted alumni #${id}: ${existing.full_name}`)
  },

  async search(query: string, programs?: string[]): Promise<AlumniRow[]> {
    return alumniRepository.search(query, programs ?? [])
  },

  getCount(filters?: AlumniFilters): number {
    return alumniRepository.getCount(filters ?? {})
  }
}
