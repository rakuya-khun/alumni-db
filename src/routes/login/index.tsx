import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth.store'
import { useAuthMode } from './-hooks/use-auth-mode'
import { useLogin } from './-hooks/use-login'
import { LoginForm } from './-components/login-form'
import { LoginError } from './-components/login-error'
import { LockoutTimer } from './-components/lockout-timer'
import { OfflineBadge } from './-components/offline-badge'

export default function LoginPage() {
  const { isAuthenticated } = useAuthStore()
  const { authMode } = useAuthMode()
  const { handleLogin, loading, error, isLockedOut, remainingSeconds } = useLogin()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-secondary p-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-card-border bg-card p-8 shadow-sm">
          {/* Logo / Title */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-primary">Alumni DB</h1>
            <p className="mt-1 text-sm text-text-secondary">
              SLSU College of Engineering
            </p>
            {authMode === 'offline' && (
              <div className="mt-3">
                <OfflineBadge />
              </div>
            )}
          </div>

          {/* Error / Lockout */}
          <div className="mb-4 space-y-3">
            {isLockedOut && <LockoutTimer remainingSeconds={remainingSeconds} />}
            {error && !isLockedOut && <LoginError message={error} />}
          </div>

          {/* Form */}
          <LoginForm
            onSubmit={handleLogin}
            loading={loading}
            disabled={isLockedOut}
          />

          <p className="mt-6 text-center text-xs text-text-muted">
            {authMode === 'offline'
              ? 'Using saved credentials. Connect to the internet for full access.'
              : 'Credentials are verified from the Accounts sheet.'}
          </p>
        </div>
      </div>
    </div>
  )
}
