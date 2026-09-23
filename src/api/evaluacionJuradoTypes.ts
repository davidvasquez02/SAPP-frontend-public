export interface CatalogoEvaluacionDto {
  codigo: string
  nombre: string
  descripcion?: string | null
}

export interface EvaluacionRegistradaDto {
  id?: number
  momento?: string
  concepto?: string | null
  resultado?: string | null
  momentoCodigo?: string
  momentoNombre?: string
  conceptoCodigo?: string | null
  conceptoNombre?: string | null
  resultadoCodigo?: string | null
  resultadoNombre?: string | null
  nota?: number | null
  observaciones?: string | null
  fechaRegistro?: string | null
}

export interface SesionEvaluadorDto {
  juradoId?: number
  nombreJurado: string
  estadoInvitacion: string
  motivoDeclinacion?: string | null
  fechaLimiteEvaluacion?: string | null
  fechaExpiracionEnlace?: string | null
  titulo: string | null
  resumen?: string | null
  nombreEstudiante?: string | null
  programa?: string | null
  tipoSolicitudCodigo?: string | null
  documentoId?: number | null
  documentoNombre?: string | null
  documentoDisponible: boolean
  fechaSustentacion?: string | null
  modalidadSustentacion?: string | null
  lugarSustentacion?: string | null
  enlaceSustentacion?: string | null
  puedeResponderInvitacion: boolean
  puedeEvaluar: boolean
  momentosPendientes: string[]
  evaluaciones: EvaluacionRegistradaDto[]
  conceptos?: CatalogoEvaluacionDto[]
  resultados?: CatalogoEvaluacionDto[]
  catalogos?: {
    conceptos?: CatalogoEvaluacionDto[]
    resultados?: CatalogoEvaluacionDto[]
  }
}

export interface DocumentoEvaluacionDto {
  nombreArchivo: string
  mimeType: string
  tamanoBytes: number
  contenidoBase64: string
}

export interface RegistrarEvaluacionPayload {
  momentoCodigo: string
  conceptoCodigo: string | null
  resultadoCodigo: string | null
  nota: number | null
  observaciones: string | null
}
