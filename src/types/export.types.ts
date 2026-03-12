export type ExportFormat = 'pdf' | 'docx' | 'excel'

export interface ExportFilters {
  programs?: string[]
  yearFrom?: number
  yearTo?: number
  isEmployed?: number
  hasLicense?: number
}

export interface ExportProgress {
  status: 'idle' | 'exporting' | 'completed' | 'failed'
  filePath?: string
  error?: string
}
