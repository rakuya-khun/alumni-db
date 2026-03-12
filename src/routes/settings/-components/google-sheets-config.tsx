import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { sheetsSettingsSchema, type SheetsSettingsData } from '../-schemas/settings.schema'
import { SheetsTestButton } from './sheets-test-button'

const DEFAULT_SHEETS_ID = '1JdeHdsiURPUHw2VsHgH5G_9SglWbt8gaFe-2KCKQU7g'

interface GoogleSheetsConfigProps {
  config: Record<string, string | null>
  onSave: (data: Record<string, string>) => Promise<void>
  onTestSheets: () => Promise<void>
  disabled?: boolean
}

export function GoogleSheetsConfig({ config, onSave, onTestSheets, disabled }: GoogleSheetsConfigProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SheetsSettingsData>({
    resolver: zodResolver(sheetsSettingsSchema),
    values: {
      spreadsheetId: config.sheets_id ?? DEFAULT_SHEETS_ID,
      serviceAccountKey: config.sheets_key ?? '',
      tabCe: config.sheets_tab_ce ?? 'CE',
      tabCpe: config.sheets_tab_cpe ?? 'CPE',
      tabEe: config.sheets_tab_ee ?? 'EE',
      gformUrlCe: config.gform_url_ce ?? '',
      gformUrlCpe: config.gform_url_cpe ?? '',
      gformUrlEe: config.gform_url_ee ?? '',
    },
  })

  const onSubmit = async (data: SheetsSettingsData) => {
    await onSave({
      sheets_id: data.spreadsheetId,
      sheets_key: data.serviceAccountKey,
      sheets_tab_ce: data.tabCe,
      sheets_tab_cpe: data.tabCpe,
      sheets_tab_ee: data.tabEe,
      gform_url_ce: data.gformUrlCe ?? '',
      gform_url_cpe: data.gformUrlCpe ?? '',
      gform_url_ee: data.gformUrlEe ?? '',
    })
  }

  const inputClass = 'h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary disabled:opacity-60'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h3 className="text-lg font-semibold text-text-primary">Google Sheets Connection</h3>

      <div>
        <label className="mb-1 block text-sm font-medium text-text-secondary">Spreadsheet ID</label>
        <input {...register('spreadsheetId')} disabled={disabled}
          placeholder="1JdeHdsiURPUHw2VsHgH5G_9SglWbt8gaFe-2KCKQU7g"
          className={inputClass} />
        <p className="mt-1 text-xs text-text-muted">The long ID from your Google Sheets URL: docs.google.com/spreadsheets/d/<strong>THIS-PART</strong>/edit</p>
        {errors.spreadsheetId && <p className="mt-1 text-xs text-error">{errors.spreadsheetId.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-text-secondary">Service Account Key (JSON)</label>
        <textarea {...register('serviceAccountKey')} disabled={disabled} rows={4}
          placeholder='{ "type": "service_account", ... }'
          className="w-full rounded-lg border border-card-border bg-surface-primary px-3 py-2 text-sm text-text-primary font-mono disabled:opacity-60" />
        {errors.serviceAccountKey && <p className="mt-1 text-xs text-error">{errors.serviceAccountKey.message}</p>}
      </div>

      <div className="rounded-xl border border-card-border bg-surface-secondary p-4">
        <h4 className="mb-3 text-sm font-semibold text-text-primary">Sheet Tab Names</h4>
        <p className="mb-3 text-xs text-text-muted">
          Enter the exact tab names in your spreadsheet where each Google Form sends its responses.
          Each program form should have its own tab.
        </p>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">CE (Civil Engineering)</label>
            <input {...register('tabCe')} disabled={disabled} placeholder="CE" className={inputClass} />
            {errors.tabCe && <p className="mt-1 text-xs text-error">{errors.tabCe.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">CpE (Computer Engineering)</label>
            <input {...register('tabCpe')} disabled={disabled} placeholder="CPE" className={inputClass} />
            {errors.tabCpe && <p className="mt-1 text-xs text-error">{errors.tabCpe.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">EE (Electrical Engineering)</label>
            <input {...register('tabEe')} disabled={disabled} placeholder="EE" className={inputClass} />
            {errors.tabEe && <p className="mt-1 text-xs text-error">{errors.tabEe.message}</p>}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-card-border bg-surface-secondary p-4">
        <h4 className="mb-3 text-sm font-semibold text-text-primary">Google Form URLs (Optional)</h4>
        <p className="mb-3 text-xs text-text-muted">
          Links to each program's Google Form — shown in the Help page and used for sending survey invitations.
        </p>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">CE Form URL</label>
            <input {...register('gformUrlCe')} disabled={disabled} placeholder="https://docs.google.com/forms/d/e/..." className={inputClass} />
            {errors.gformUrlCe && <p className="mt-1 text-xs text-error">{errors.gformUrlCe.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">CpE Form URL</label>
            <input {...register('gformUrlCpe')} disabled={disabled} placeholder="https://docs.google.com/forms/d/e/..." className={inputClass} />
            {errors.gformUrlCpe && <p className="mt-1 text-xs text-error">{errors.gformUrlCpe.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">EE Form URL</label>
            <input {...register('gformUrlEe')} disabled={disabled} placeholder="https://docs.google.com/forms/d/e/..." className={inputClass} />
            {errors.gformUrlEe && <p className="mt-1 text-xs text-error">{errors.gformUrlEe.message}</p>}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={disabled || isSubmitting}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-light disabled:opacity-50">
          Save Sheets Settings
        </button>
        <SheetsTestButton onTest={onTestSheets} disabled={disabled} />
      </div>
    </form>
  )
}
