export const ESTADOS_ESTUDIANTE = ['ACTIVO', 'INACTIVO', 'EGRESADO'] as const

export type EstadoEstudiante = (typeof ESTADOS_ESTUDIANTE)[number]

export interface EstudianteResumen {
  id: number
  estado: EstadoEstudiante
}

