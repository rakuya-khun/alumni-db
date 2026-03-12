import { useNetwork } from '../../../hooks/use-network'

export function useAuthMode() {
  const { isOnline } = useNetwork()
  return { authMode: isOnline ? 'online' as const : 'offline' as const, isOnline }
}
