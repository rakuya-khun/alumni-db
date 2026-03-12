import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../stores/auth.store'
import { useLockout } from './use-lockout'

export function useLogin() {
  const navigate = useNavigate()
  const { login, error: storeError, loading } = useAuthStore()
  const { attempts, isLockedOut, remainingSeconds, recordFailedAttempt, resetAttempts } = useLockout()
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (username: string, password: string) => {
    if (isLockedOut) return
    setError(null)
    try {
      await login(username, password)
      resetAttempts()
      navigate('/', { replace: true })
    } catch (err) {
      recordFailedAttempt()
      setError((err as Error).message)
    }
  }

  return {
    handleLogin,
    loading,
    error: error ?? storeError,
    attempts,
    isLockedOut,
    remainingSeconds,
  }
}
