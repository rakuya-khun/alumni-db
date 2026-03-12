import { useAuthStore } from '../stores/auth.store'

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isOffline = useAuthStore((s) => s.isOffline)
  const loading = useAuthStore((s) => s.loading)
  const error = useAuthStore((s) => s.error)
  const login = useAuthStore((s) => s.login)
  const logout = useAuthStore((s) => s.logout)
  const clearError = useAuthStore((s) => s.clearError)

  return {
    user,
    isAuthenticated,
    isOffline,
    loading,
    error,
    login,
    logout,
    clearError,
    role: user?.role ?? null,
    fullName: user?.fullName ?? '',
    accessiblePrograms: user?.accessiblePrograms ?? [],
  }
}
