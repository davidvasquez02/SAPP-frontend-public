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
  inscripcionAdmisionId?: number | null
  observaciones?: string | null
}
