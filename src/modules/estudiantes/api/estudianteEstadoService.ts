import { API_URL } from '../../../api/config'
import { httpPut } from '../../../shared/http/httpClient'
import type { EstadoEstudiante } from '../types'

interface ApiResponse<T> {
  ok: boolean
  message?: string
  data: T
}

const getEstudiantesEndpoint = (estudianteId: number) => {
  const path = `/estudiantes/${estudianteId}/estado`

  if (API_URL.startsWith('http://') || API_URL.startsWith('https://')) {
    return `${new URL(API_URL).origin}${path}`
  }

  return typeof window === 'undefined' ? path : new URL(path, window.location.origin).toString()
}

/** Actualiza el estado académico de un estudiante. */
export async function actualizarEstadoEstudiante(
  estudianteId: number,
  estado: EstadoEstudiante,
): Promise<void> {
  const response = await httpPut<ApiResponse<unknown> | Record<string, unknown> | undefined>(
    getEstudiantesEndpoint(estudianteId),
    { estado },
  )

  // El endpoint puede responder 204. Si usa el wrapper estándar de SAPP,
  // conservamos su mensaje de negocio cuando la operación no fue exitosa.
  if (response && 'ok' in response && response.ok === false) {
    const message = 'message' in response && typeof response.message === 'string'
      ? response.message
      : 'No fue posible actualizar el estado del estudiante.'
    throw new Error(message)
  }
}
