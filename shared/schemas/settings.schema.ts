import { z } from 'zod'

export const smtpSettingsSchema = z.object({
  host: z.string().min(1, 'SMTP host is required'),
  port: z.coerce.number().int().min(1).max(65535, 'Port must be 1–65535'),
  user: z.string().min(1, 'SMTP username is required'),
  pass: z.string().min(1, 'SMTP password is required'),
  from: z.string().email('Invalid sender email address'),
})

export type SmtpSettingsData = z.infer<typeof smtpSettingsSchema>

export const sheetsSettingsSchema = z.object({
  spreadsheetId: z.string().min(1, 'Spreadsheet ID is required'),
  serviceAccountKey: z.string().min(1, 'Service account key is required'),
  tabCe: z.string().min(1, 'CE tab name is required').default('CE'),
  tabCpe: z.string().min(1, 'CpE tab name is required').default('CPE'),
  tabEe: z.string().min(1, 'EE tab name is required').default('EE'),
  gformUrlCe: z.string().url('Invalid URL').optional().or(z.literal('')),
  gformUrlCpe: z.string().url('Invalid URL').optional().or(z.literal('')),
  gformUrlEe: z.string().url('Invalid URL').optional().or(z.literal('')),
})

export type SheetsSettingsData = z.infer<typeof sheetsSettingsSchema>

export const preferencesSchema = z.object({
  darkMode: z.boolean().default(false),
  autoSync: z.boolean().default(false),
  syncInterval: z.coerce.number().int().min(1).max(60).default(5),
})

export type PreferencesData = z.infer<typeof preferencesSchema>
