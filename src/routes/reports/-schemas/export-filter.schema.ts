import { z } from 'zod'

export const PAPER_SIZES = ['short', 'long', 'a4'] as const
export type PaperSize = (typeof PAPER_SIZES)[number]

export const PAPER_SIZE_LABELS: Record<PaperSize, string> = {
  short: 'Short (Letter)',
  long: 'Long (Legal)',
  a4: 'A4',
}

export const exportFilterSchema = z.object({
  programs: z.array(z.string()).optional(),
  yearFrom: z.coerce.number().min(2018).optional(),
  yearTo: z.coerce.number().optional(),
  isEmployed: z.coerce.number().optional(),
  hasLicense: z.coerce.number().optional(),
  search: z.string().optional(),
  paperSize: z.enum(PAPER_SIZES).optional(),
})

export type ExportFilterData = z.infer<typeof exportFilterSchema>
