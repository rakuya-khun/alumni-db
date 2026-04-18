import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { accountSchema, accountUpdateSchema, type AccountFormData } from '../-schemas/account.schema'
import { X } from 'lucide-react'
import type { AccountEntry } from '../../../../shared/types/auth.types'

const ROLES = ['Dean', 'CE Chair', 'CpE Chair', 'EE Chair'] as const

interface AccountFormDialogProps {
  account?: AccountEntry
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onClose: () => void
}

export function AccountFormDialog({ account, onSubmit, onClose }: AccountFormDialogProps) {
  const isEdit = !!account

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormData>({
    resolver: zodResolver(isEdit ? accountUpdateSchema : accountSchema),
    defaultValues: isEdit
      ? { username: account.username, fullName: account.fullName, role: account.role as AccountFormData['role'], isActive: account.isActive, password: '' }
      : { username: '', password: '', fullName: '', role: 'CE Chair', isActive: true },
  })

  const onFormSubmit = async (data: AccountFormData) => {
    const payload: Record<string, unknown> = { ...data }
    if (isEdit && !payload.password) {
      delete payload.password
    }
    await onSubmit(payload)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl border border-card-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">{isEdit ? 'Edit Account' : 'Create Account'}</h3>
          <button onClick={onClose} className="rounded p-1 text-text-secondary hover:bg-surface-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">Username</label>
            <input {...register('username')} disabled={isEdit}
              className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary disabled:opacity-60" />
            {errors.username && <p className="mt-1 text-xs text-error">{errors.username.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">
              {isEdit ? 'New Password (leave blank to keep)' : 'Password'}
            </label>
            <input {...register('password')} type="password"
              className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary" />
            {errors.password && <p className="mt-1 text-xs text-error">{errors.password.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">Full Name</label>
            <input {...register('fullName')}
              className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary" />
            {errors.fullName && <p className="mt-1 text-xs text-error">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">Role</label>
            <select {...register('role')}
              className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary">
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            {errors.role && <p className="mt-1 text-xs text-error">{errors.role.message}</p>}
          </div>

          <label className="flex items-center gap-2">
            <input {...register('isActive')} type="checkbox" className="h-4 w-4 rounded border-card-border accent-primary" />
            <span className="text-sm text-text-primary">Active</span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-card-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-light disabled:opacity-50">
              {isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
