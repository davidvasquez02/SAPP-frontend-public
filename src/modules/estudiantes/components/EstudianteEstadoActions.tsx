import { useState } from 'react'
import { actualizarEstadoEstudiante } from '../api/estudianteEstadoService'
import type { EstadoEstudiante } from '../types'
import './EstudianteEstadoActions.css'

interface EstudianteEstadoActionsProps {
  estudianteId: number
  estado: EstadoEstudiante
  onEstadoActualizado?: (estado: EstadoEstudiante) => void
}

const LABELS: Record<EstadoEstudiante, string> = {
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo',
  EGRESADO: 'Egresado',
}

export function EstudianteEstadoActions({
  estudianteId,
  estado,
  onEstadoActualizado,
}: EstudianteEstadoActionsProps) {
  const [estadoActual, setEstadoActual] = useState(estado)
  const [estadoEnProceso, setEstadoEnProceso] = useState<EstadoEstudiante | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const cambiarEstado = async (nuevoEstado: EstadoEstudiante) => {
    setEstadoEnProceso(nuevoEstado)
    setMensaje(null)
    setError(null)

    try {
      await actualizarEstadoEstudiante(estudianteId, nuevoEstado)
      setEstadoActual(nuevoEstado)
      setMensaje(`El estudiante ahora se encuentra ${LABELS[nuevoEstado].toLowerCase()}.`)
      onEstadoActualizado?.(nuevoEstado)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible actualizar el estado del estudiante.',
      )
    } finally {
      setEstadoEnProceso(null)
    }
  }

  const estadoAlterno = estadoActual === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
  const procesando = estadoEnProceso !== null

  return (
    <section className="estudiante-estado" aria-labelledby="estudiante-estado-titulo">
      <div className="estudiante-estado__encabezado">
        <div>
          <h2 id="estudiante-estado-titulo">Estado del estudiante</h2>
          <p>Administra la condición académica actual.</p>
        </div>
        <span
          className={`estudiante-estado__badge estudiante-estado__badge--${estadoActual.toLowerCase()}`}
        >
          {LABELS[estadoActual]}
        </span>
      </div>

      {estadoActual !== 'EGRESADO' && (
        <div className="estudiante-estado__acciones">
          <button
            className="estudiante-estado__boton estudiante-estado__boton--principal"
            type="button"
            disabled={procesando}
            onClick={() => void cambiarEstado(estadoAlterno)}
          >
            {estadoEnProceso === estadoAlterno
              ? 'Actualizando…'
              : estadoAlterno === 'ACTIVO'
                ? 'Activar estudiante'
                : 'Inactivar estudiante'}
          </button>
          <button
            className="estudiante-estado__boton estudiante-estado__boton--egresado"
            type="button"
            disabled={procesando}
            onClick={() => void cambiarEstado('EGRESADO')}
          >
            {estadoEnProceso === 'EGRESADO' ? 'Actualizando…' : 'Marcar como egresado'}
          </button>
        </div>
      )}

      {mensaje && <p className="estudiante-estado__mensaje estudiante-estado__mensaje--exito" role="status">{mensaje}</p>}
      {error && <p className="estudiante-estado__mensaje estudiante-estado__mensaje--error" role="alert">{error}</p>}
    </section>
  )
}
