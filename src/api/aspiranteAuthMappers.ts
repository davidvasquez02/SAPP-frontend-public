import type { AspiranteConsultaInfoDto } from './aspiranteConsultaTypes'
import type { AuthSession } from '../context/Auth/types'

const buildNombreCompleto = (dto: AspiranteConsultaInfoDto): string | undefined => {
  const nombreCompleto = [dto.nombre1, dto.nombre2, dto.apellido1, dto.apellido2]
    .map((parte) => parte?.trim())
    .filter((parte): parte is string => Boolean(parte))
    .join(' ')

  return nombreCompleto || undefined
}

export const mapAspiranteInfoToSession = (dto: AspiranteConsultaInfoDto): AuthSession => {
  const numeroInscripcionUisStr = String(dto.numeroInscripcionUis)

  return {
    kind: 'ASPIRANTE',
    accessToken: 'NO_TOKEN',
    user: {
      id: dto.id,
      roles: ['ASPIRANTE'],
      numeroInscripcionUis: numeroInscripcionUisStr,
      tipoDocumentoIdentificacion: dto.tipoDocumentoIdentificacion,
      numeroDocumento: dto.numeroDocumento,
      emailPersonal: dto.emailPersonal ?? undefined,
      fechaRegistro: dto.fechaRegistro ?? undefined,
      observaciones: dto.observaciones ?? null,
      inscripcionAdmisionId: dto.inscripcionAdmisionId ?? null,
      nombre: buildNombreCompleto(dto),
      nombre1: dto.nombre1 ?? undefined,
      nombre2: dto.nombre2 ?? undefined,
      apellido1: dto.apellido1 ?? undefined,
      apellido2: dto.apellido2 ?? undefined,
      foto: dto.foto ?? undefined,
      director: dto.director ?? undefined,
      grupoInvestigacion: dto.grupoInvestigacion ?? undefined,
      telefono: dto.telefono ?? undefined,
      fechaInscripcion: dto.fechaInscripcion ?? undefined,
      fechaResultado: dto.fechaResultado ?? undefined,
      observacionesInscripcion: dto.observacionesInscripcion ?? null,
      estadoInscripcion: dto.estadoInscripcion,
      posicionAdmision: dto.posicionAdmision ?? null,
      puntajeTotal: dto.puntajeTotal ?? null,
      convocatoria: { ...dto.convocatoria },
    },
  }
}
