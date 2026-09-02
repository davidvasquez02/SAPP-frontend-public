export interface AspiranteConvocatoria {
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

export interface AspiranteUser {
  id: number
  roles: string[]
  numeroInscripcionUis: string
  nombre?: string
  nombre1?: string
  nombre2?: string
  apellido1?: string
  apellido2?: string
  foto?: string
  director?: string
  grupoInvestigacion?: string
  telefono?: string
  tipoDocumentoIdentificacion: string
  numeroDocumento: string
  emailPersonal?: string
  fechaRegistro?: string
  fechaInscripcion?: string
  fechaResultado?: string
  observaciones?: string | null
  observacionesInscripcion?: string | null
  inscripcionAdmisionId?: number | null
  estadoInscripcion: string
  posicionAdmision?: number | null
  puntajeTotal?: number | null
  convocatoria: AspiranteConvocatoria
}

export interface AspiranteLoginParams {
  numeroInscripcion: string
  tipoDocumentoId: number
  numeroDocumento: string
}

export interface AuthSession {
  kind: 'ASPIRANTE'
  accessToken: string
  user: AspiranteUser
}

export interface AuthContextValue {
  session: AuthSession | null
  user: AspiranteUser | null
  token: string | null
  isAuthenticated: boolean
  loginAspirante: (params: AspiranteLoginParams) => Promise<void>
  logout: () => void
}
