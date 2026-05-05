import { z } from 'zod'
import type { PeoFilters } from '../types/peo.types'

const PROGRAMS = ['BSCE', 'BSCpE', 'BSEE'] as const

export const peoFiltersSchema = z.object({
  programs: z.array(z.enum(PROGRAMS)).optional(),
  yearFrom: z.number().int().min(2018).optional(),
  yearTo: z.number().int().min(2018).optional(),
  denominatorMode: z.enum(['total', 'employed']).optional(),
  asOfYear: z.number().int().min(2018).optional()
}) satisfies z.ZodType<PeoFilters>

export type PeoFiltersInput = z.infer<typeof peoFiltersSchema>
