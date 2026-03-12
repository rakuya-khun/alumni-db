import { useUIStore, type Toast } from '../stores/ui.store'

export function useToast() {
  const { toasts, addToast, removeToast } = useUIStore()

  const success = (title: string, message?: string) =>
    addToast({ type: 'success', title, message })

  const error = (title: string, message?: string) =>
    addToast({ type: 'error', title, message, duration: 8000 })

  const warning = (title: string, message?: string) =>
    addToast({ type: 'warning', title, message })

  const info = (title: string, message?: string) =>
    addToast({ type: 'info', title, message })

  return { toasts, addToast, removeToast, success, error, warning, info }
}

export type { Toast }
