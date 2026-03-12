import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { loginSchema, type LoginFormData } from '../-schemas/login.schema'
import { useState, useEffect } from 'react'

const REMEMBER_KEY = 'alumni-db-remember'

interface LoginFormProps {
  onSubmit: (username: string, password: string) => Promise<void>
  loading: boolean
  disabled: boolean
}

export function LoginForm({ onSubmit, loading, disabled }: LoginFormProps) {
  const [rememberMe, setRememberMe] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // Restore saved username on mount
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY)
    if (saved) {
      try {
        const { username } = JSON.parse(saved)
        if (username) {
          setValue('username', username)
          setRememberMe(true)
        }
      } catch { /* ignore corrupt data */ }
    }
  }, [setValue])

  const handleFormSubmit = handleSubmit(async (data) => {
    if (rememberMe) {
      localStorage.setItem(REMEMBER_KEY, JSON.stringify({ username: data.username }))
    } else {
      localStorage.removeItem(REMEMBER_KEY)
    }
    await onSubmit(data.username, data.password)
  })

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div>
        <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-text-primary">
          Username
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          disabled={disabled}
          {...register('username')}
          className="h-11 w-full rounded-lg border border-card-border bg-surface-secondary px-4 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          placeholder="Enter your username"
        />
        {errors.username && (
          <p className="mt-1 text-xs text-error">{errors.username.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-text-primary">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          disabled={disabled}
          {...register('password')}
          className="h-11 w-full rounded-lg border border-card-border bg-surface-secondary px-4 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          placeholder="Enter your password"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-error">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          id="rememberMe"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4 rounded border-card-border text-primary focus:ring-primary"
        />
        <label htmlFor="rememberMe" className="text-sm text-text-secondary select-none cursor-pointer">
          Remember me
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || disabled}
        className="flex h-11 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-light disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="mr-2 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  )
}
