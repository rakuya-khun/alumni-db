import { useCallback, useEffect, useState } from 'react'

const MAX_ATTEMPTS = 3
const LOCKOUT_MS = 5 * 60 * 1000

export function useLockout() {
  const [attempts, setAttempts] = useState(0)
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null)
  const [remainingSeconds, setRemainingSeconds] = useState(0)

  const isLockedOut = lockoutEndTime !== null && Date.now() < lockoutEndTime

  useEffect(() => {
    if (!lockoutEndTime) return
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((lockoutEndTime - Date.now()) / 1000))
      setRemainingSeconds(remaining)
      if (remaining <= 0) {
        setLockoutEndTime(null)
        setAttempts(0)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [lockoutEndTime])

  const recordFailedAttempt = useCallback(() => {
    setAttempts((prev) => {
      const next = prev + 1
      if (next >= MAX_ATTEMPTS) {
        setLockoutEndTime(Date.now() + LOCKOUT_MS)
      }
      return next
    })
  }, [])

  const resetAttempts = useCallback(() => {
    setAttempts(0)
    setLockoutEndTime(null)
  }, [])

  return { attempts, isLockedOut, remainingSeconds, recordFailedAttempt, resetAttempts }
}
