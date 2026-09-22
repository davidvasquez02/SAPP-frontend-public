import { httpGet, httpPost } from '../shared/http/httpClient'
import type {
  DocumentoEvaluacionDto,
  RegistrarEvaluacionPayload,
  SesionEvaluadorDto,
} from './evaluacionJuradoTypes'

interface ApiResponse<T> {
  ok: boolean
  message: string
  data: T
}

const route = (token: string, suffix = '') =>
  `/evaluacion/${encodeURIComponent(token)}${suffix}`

export const getSesionEvaluador = async (token: string) =>
  (await httpGet<ApiResponse<SesionEvaluadorDto>>(route(token), { auth: false })).data

export const aceptarInvitacion = async (token: string) =>
  (await httpPost<ApiResponse<SesionEvaluadorDto>>(route(token, '/aceptar'), undefined, { auth: false })).data

export const declinarInvitacion = async (token: string, motivo?: string) =>
  (
    await httpPost<ApiResponse<SesionEvaluadorDto>>(
      route(token, '/declinar'),
      motivo ? { motivo } : {},
      { auth: false },
    )
  ).data

export const descargarDocumentoEvaluacion = async (token: string) =>
  (await httpGet<ApiResponse<DocumentoEvaluacionDto>>(route(token, '/documento'), { auth: false })).data

export const registrarEvaluacion = async (
  token: string,
  payload: RegistrarEvaluacionPayload,
) =>
  (
    await httpPost<ApiResponse<SesionEvaluadorDto>>(route(token, '/evaluacion'), payload, {
      auth: false,
    })
  ).data
