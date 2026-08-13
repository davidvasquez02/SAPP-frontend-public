const LOCAL_API_URL = 'http://localhost:8080/api/sapp'
const SERVER_API_URL = '/api/sapp'

const normalizeLegacyApiBaseUrl = (value: string) => {
  const trimmedValue = value.replace(/\/+$/, '')

  if (trimmedValue.endsWith('/api') || trimmedValue.endsWith('/api/sapp')) {
    return trimmedValue
  }

  return `${trimmedValue}/api`
}

export const API_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.VITE_API_BASE_URL
    ? normalizeLegacyApiBaseUrl(import.meta.env.VITE_API_BASE_URL)
    : undefined) ??
  (import.meta.env.DEV ? LOCAL_API_URL : SERVER_API_URL)

export const API_BASE_URL = API_URL
