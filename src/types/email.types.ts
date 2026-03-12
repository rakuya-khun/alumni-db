export interface EmailCompose {
  subject: string
  body: string
  includeGformLink: boolean
  recipientFilters: {
    programs?: string[]
    yearFrom?: number
    yearTo?: number
  }
}

export interface EmailHistoryRow {
  id: number
  subject: string
  recipientCount: number
  sentAt: string
  status: 'completed' | 'partial' | 'failed'
  errorCount: number
}

export interface TemplateVariable {
  key: string
  label: string
  placeholder: string
}
