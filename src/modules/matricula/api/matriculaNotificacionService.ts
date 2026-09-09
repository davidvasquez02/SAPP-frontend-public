import { httpGet, httpPost } from '../../../shared/http/httpClient'
import type { PeriodoAcademicoFecha } from '../types'

interface ApiResponse<T> {
  ok: boolean
  message?: string
  data: T
}

const CODIGO_TRAMITE_MATRICULA = 1003

const esFechaDeMatricula = ({ tipoTramite }: PeriodoAcademicoFecha) =>
  tipoTramite.codigo === CODIGO_TRAMITE_MATRICULA ||
  tipoTramite.nombre.trim().toUpperCase() === 'MATRICULA' ||
  tipoTramite.nombre.trim().toUpperCase() === 'MATRÍCULA'

const validarRespuesta = <T>(response: ApiResponse<T>, defaultMessage: string) => {
  if (!response.ok) {
    throw new Error(response.message || defaultMessage)
  }

  return response.data
}

/** Consulta el periodo con fechas vigentes para el trámite de matrícula. */
export async function consultarPeriodoMatriculaVigente(): Promise<PeriodoAcademicoFecha | null> {
  const response = await httpGet<ApiResponse<PeriodoAcademicoFecha[]>>(
    '/periodoAcademicoFecha/vigente',
  )
  const fechasVigentes = validarRespuesta(
    response,
    'No fue posible consultar el periodo de matrícula vigente.',
  )

  return fechasVigentes.find(esFechaDeMatricula) ?? null
}

/** Solicita al backend el envío de la notificación de apertura de matrícula. */
export async function notificarAperturaMatricula(periodoId: number): Promise<string> {
  const query = new URLSearchParams({ periodoId: String(periodoId) })
  const response = await httpPost<ApiResponse<unknown> | undefined>(
    `/matriculaAcademica/notificarAperturaMatricula?${query.toString()}`,
  )

  if (response) {
    validarRespuesta(response, 'No fue posible enviar la notificación de apertura de matrícula.')
  }

  return response?.message || 'La notificación de inicio de matrícula fue enviada correctamente.'
}
