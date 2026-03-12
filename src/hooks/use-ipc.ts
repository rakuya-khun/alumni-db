import { useCallback, useState } from 'react'

interface UseIpcOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function useIpc<TResult, TArgs extends unknown[] = []>(
  fn: (...args: TArgs) => Promise<TResult>,
  options?: UseIpcOptions
) {
  const [data, setData] = useState<TResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      setLoading(true)
      setError(null)
      try {
        const result = await fn(...args)
        setData(result)
        options?.onSuccess?.()
        return result
      } catch (err) {
        const message = (err as Error).message
        setError(message)
        options?.onError?.(message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [fn, options]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { data, loading, error, execute, reset }
}
