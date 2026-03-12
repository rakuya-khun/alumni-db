import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { smtpSettingsSchema, type SmtpSettingsData } from '../-schemas/settings.schema'
import { SmtpTestButton } from './smtp-test-button'

interface SmtpFormProps {
  config: Record<string, string | null>
  onSave: (data: Record<string, string>) => Promise<void>
  onTestSmtp: () => Promise<void>
  disabled?: boolean
}

export function SmtpForm({ config, onSave, onTestSmtp, disabled }: SmtpFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SmtpSettingsData>({
    resolver: zodResolver(smtpSettingsSchema),
    values: {
      host: config.smtp_host ?? '',
      port: Number(config.smtp_port) || 587,
      user: config.smtp_user ?? '',
      pass: config.smtp_pass ?? '',
      from: config.smtp_from ?? '',
    },
  })

  const onSubmit = async (data: SmtpSettingsData) => {
    await onSave({
      smtp_host: data.host,
      smtp_port: String(data.port),
      smtp_user: data.user,
      smtp_pass: data.pass,
      smtp_from: data.from,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Email Server (SMTP)</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Host</label>
          <input {...register('host')} disabled={disabled} placeholder="smtp.gmail.com"
            className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary disabled:opacity-60" />
          {errors.host && <p className="mt-1 text-xs text-error">{errors.host.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Port</label>
          <input {...register('port')} type="number" disabled={disabled} placeholder="587"
            className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary disabled:opacity-60" />
          {errors.port && <p className="mt-1 text-xs text-error">{errors.port.message}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-text-secondary">Username</label>
        <input {...register('user')} disabled={disabled} placeholder="alumni@university.edu"
          className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary disabled:opacity-60" />
        {errors.user && <p className="mt-1 text-xs text-error">{errors.user.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-text-secondary">Password</label>
        <input {...register('pass')} type="password" disabled={disabled} placeholder="App password"
          className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary disabled:opacity-60" />
        {errors.pass && <p className="mt-1 text-xs text-error">{errors.pass.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-text-secondary">Sender Email</label>
        <input {...register('from')} disabled={disabled} placeholder="alumni@university.edu"
          className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary disabled:opacity-60" />
        {errors.from && <p className="mt-1 text-xs text-error">{errors.from.message}</p>}
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={disabled || isSubmitting}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-light disabled:opacity-50">
          Save SMTP Settings
        </button>
        <SmtpTestButton onTest={onTestSmtp} disabled={disabled} />
      </div>
    </form>
  )
}
