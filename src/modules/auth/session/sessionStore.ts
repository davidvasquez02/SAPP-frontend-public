import type { AuthSession } from '../../../context/Auth/types'

const STORAGE_KEY = 'SAPP_AUTH_SESSION'
const LEGACY_STORAGE_KEY = 'session'
const NO_TOKEN_VALUE = 'NO_TOKEN'

let cachedSession: AuthSession | null = null

export const getSession = (): AuthSession | null => {
  return cachedSession
}

export function getToken(): string | null {
  const session = cachedSession ?? getSession()
  const token = session?.accessToken ?? null

  if (!token || token === NO_TOKEN_VALUE) {
    return null
  }

  return token
}

export function saveSession(session: AuthSession): void {
  cachedSession = session
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(LEGACY_STORAGE_KEY)
}

export function clearSession(): void {
  cachedSession = null
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(LEGACY_STORAGE_KEY)
}
