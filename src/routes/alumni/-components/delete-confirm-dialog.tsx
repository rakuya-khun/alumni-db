import { AlertTriangle, X } from 'lucide-react'

interface DeleteConfirmDialogProps {
  name: string
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export function DeleteConfirmDialog({ name, open, onClose, onConfirm, loading }: DeleteConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl border border-card-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error/10">
              <AlertTriangle className="h-5 w-5 text-error" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">Delete Record</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-surface-secondary">
            <X className="h-5 w-5 text-text-muted" />
          </button>
        </div>

        <p className="mb-2 text-sm text-text-secondary">
          Are you sure you want to delete the record for <strong>{name}</strong>?
        </p>
        <p className="mb-6 text-sm text-error">
          This action cannot be undone. The record will be permanently removed.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="h-10 rounded-lg border border-card-border px-6 text-sm font-medium text-text-primary hover:bg-surface-secondary disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="h-10 rounded-lg bg-error px-6 text-sm font-medium text-white hover:bg-error/90 disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}