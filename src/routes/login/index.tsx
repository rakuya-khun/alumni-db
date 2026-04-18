import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Pause, Play } from 'lucide-react'
import { useAuthStore } from '../../stores/auth.store'
import { useAuthMode } from './-hooks/use-auth-mode'
import { useLogin } from './-hooks/use-login'
import { LoginForm } from './-components/login-form'
import { LoginError } from './-components/login-error'
import { LockoutTimer } from './-components/lockout-timer'
import { OfflineBadge } from './-components/offline-badge'
import { EngineeringBackground } from './-components/engineering-background'
import CEN_BG from '../../assets/CEN_BG.png'
import CEN_LOGO from '../../assets/CEN._LOGOpng.png'

export default function LoginPage() {
  const { isAuthenticated } = useAuthStore()
  const { authMode } = useAuthMode()
  const { handleLogin, loading, error, isLockedOut, remainingSeconds } = useLogin()
  const [animating, setAnimating] = useState(true)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* ── Left Column: Image ── */}
      <div className="relative hidden w-1/2 lg:block">
        <img
          src={CEN_BG}
          alt="College of Engineering"
          className="h-full w-full object-cover"
        />
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-black/40" />
        {/* Branding over image */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-10 text-center">
          <img src={CEN_LOGO} alt="CEN Logo" className="h-28 w-28 drop-shadow-lg" />
          <h2 className="text-3xl font-bold text-white drop-shadow-md">
            College of Engineering
          </h2>
          <p className="max-w-sm text-sm text-white/80 drop-shadow">
            Southern Luzon State University — Alumni Database Management System
          </p>
        </div>
      </div>

      {/* ── Right Column: Form + Animated Background ── */}
      <div className="relative flex w-full flex-col items-center justify-center bg-surface-secondary lg:w-1/2">
        {/* Animated engineering-themed background */}
        <EngineeringBackground animate={animating} />

        {/* Animation toggle */}
        <button
          type="button"
          onClick={() => setAnimating((v) => !v)}
          className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-lg border border-card-border bg-card/80 px-3 py-1.5 text-xs text-text-secondary backdrop-blur transition-colors hover:bg-card hover:text-text-primary"
          title={animating ? 'Pause animation' : 'Resume animation'}
        >
          {animating ? <Pause size={14} /> : <Play size={14} />}
          <span>{animating ? 'Pause' : 'Play'}</span>
        </button>

        {/* Login card */}
        <div className="z-10 w-full max-w-md px-6">
          <div className="rounded-xl border border-card-border bg-card/90 p-8 shadow-lg backdrop-blur-sm">
            {/* Logo / Title */}
            <div className="mb-6 text-center">
              {/* Show logo on small screens where left panel is hidden */}
              <img
                src={CEN_LOGO}
                alt="CEN Logo"
                className="mx-auto mb-3 h-16 w-16 lg:hidden"
              />
              <h1 className="text-3xl font-bold text-primary">Alumni DB</h1>
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
    </div>
  )
}
