export interface AspiranteConvocatoriaDto {
  cupos: number
  fechaFin: string
  fechaInicio: string
  id: number
  observaciones?: string | null
  periodo: string
  periodoId: number
  programa: string
  programaId: number
  vigente: boolean
}

export interface AspiranteConsultaInfoDto {
  id: number
  director?: string | null
  grupoInvestigacion?: string | null
  nombre1?: string | null
  nombre2?: string | null
  apellido1?: string | null
  apellido2?: string | null
  foto?: string | null
  telefono?: string | null
  numeroInscripcionUis: number | string
  tipoDocumentoIdentificacion: string
  numeroDocumento: string
  emailPersonal?: string | null
  fechaRegistro?: string | null
  fechaInscripcion?: string | null
  fechaResultado?: string | null
  inscripcionAdmisionId?: number | null
  observaciones?: string | null
  observacionesInscripcion?: string | null
  estadoInscripcion: string
  posicionAdmision?: number | null
  puntajeTotal?: number | null
  convocatoria: AspiranteConvocatoriaDto
}
