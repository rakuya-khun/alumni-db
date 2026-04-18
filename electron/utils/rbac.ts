import { authService } from '../services/auth.service'

/**
 * Get the current session or throw if not authenticated.
 */
export function requireSession() {
  const session = authService.getSession()
  if (!session) throw new Error('Not authenticated')
  return session
}

/**
 * Inject role-based program scoping into filters.
 * Intersects any requested programs with the user's accessible programs.
 */
export function scopeFilters<T extends Record<string, unknown>>(filters?: T): T {
  const session = requireSession()
  const allowed = session.accessiblePrograms as string[]
  const safe = { ...(filters ?? {}) } as T & { programs?: string[] }
  const requested = Array.isArray(safe.programs) ? safe.programs : []

  if (requested.length > 0) {
    const intersection = requested.filter((p) => allowed.includes(p))
    safe.programs = intersection.length > 0 ? intersection : allowed
  } else {
    safe.programs = allowed
  }

  return safe
}

/**
 * Assert that a specific program is accessible to the current user.
 */
export function assertProgramAccess(program: string): void {
  const session = requireSession()
  if (!session.accessiblePrograms.includes(program)) {
    throw new Error('You do not have permission to access this program\'s data.')
  }
}
