import { AUTH_SESSION_STORAGE_KEY } from '../constants/auth'
import type { AuthSession } from '../types/auth'

function canUseStorage() {
  return typeof window !== 'undefined'
}

export function isValidAuthSession(session: unknown): session is AuthSession {
  if (!session || typeof session !== 'object') {
    return false
  }

  const candidate = session as AuthSession
  return Boolean(candidate.user?.id && candidate.token?.accessToken)
}

export function readStoredAuthSession() {
  if (!canUseStorage()) {
    return null
  }

  const rawSession = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY)
  if (!rawSession) {
    return null
  }

  try {
    const parsedSession = JSON.parse(rawSession) as unknown
    if (!isValidAuthSession(parsedSession)) {
      throw new Error('Invalid auth session')
    }

    return parsedSession
  }
  catch {
    window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY)
    return null
  }
}

export function writeStoredAuthSession(session: AuthSession | null) {
  if (!canUseStorage()) {
    return
  }

  if (!session) {
    window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session))
}
