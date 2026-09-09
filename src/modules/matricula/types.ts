export interface PeriodoAcademico {
  anio: number
  anioPeriodo: string
  descripcion: string
  fechaFin: string
  fechaInicio: string
  id: number
  periodo: number
}

export interface TipoTramite {
  codigo: number
  id: number
  nombre: string
}

export interface PeriodoAcademicoFecha {
  descripcion: string
  fechaFin: string
  fechaInicio: string
  id: number
  periodo: PeriodoAcademico
  tipoTramite: TipoTramite
}
