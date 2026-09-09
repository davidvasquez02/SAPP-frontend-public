import { useCallback, useEffect, useState } from 'react'
import {
  consultarPeriodoMatriculaVigente,
  notificarAperturaMatricula,
} from '../api/matriculaNotificacionService'
import type { PeriodoAcademicoFecha } from '../types'
import './NotificacionAperturaMatricula.css'

interface NotificacionAperturaMatriculaProps {
  onNotificacionEnviada?: (periodoId: number) => void
}

const formatearFecha = (fecha: string) =>
  new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${fecha}T00:00:00Z`))

export function NotificacionAperturaMatricula({
  onNotificacionEnviada,
}: NotificacionAperturaMatriculaProps) {
  const [periodoVigente, setPeriodoVigente] = useState<PeriodoAcademicoFecha | null>(null)
  const [consultando, setConsultando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const consultarVigencia = useCallback(async () => {
    setConsultando(true)
    setMensaje(null)
    setError(null)

    try {
      setPeriodoVigente(await consultarPeriodoMatriculaVigente())
    } catch (requestError) {
      setPeriodoVigente(null)
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible consultar el periodo de matrícula vigente.',
      )
    } finally {
      setConsultando(false)
    }
  }, [])

  useEffect(() => {
    let activo = true

    consultarPeriodoMatriculaVigente()
      .then((periodo) => {
        if (activo) setPeriodoVigente(periodo)
      })
      .catch((requestError: unknown) => {
        if (!activo) return
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'No fue posible consultar el periodo de matrícula vigente.',
        )
      })
      .finally(() => {
        if (activo) setConsultando(false)
      })

    return () => {
      activo = false
    }
  }, [])

  const enviarNotificacion = async () => {
    if (!periodoVigente) return

    setEnviando(true)
    setMensaje(null)
    setError(null)

    try {
      const respuesta = await notificarAperturaMatricula(periodoVigente.periodo.id)
      setMensaje(respuesta)
      onNotificacionEnviada?.(periodoVigente.periodo.id)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible enviar la notificación de apertura de matrícula.',
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="notificacion-matricula" aria-labelledby="notificacion-matricula-titulo">
      <div className="notificacion-matricula__encabezado">
        <div>
          <h2 id="notificacion-matricula-titulo">Notificación de inicio de matrícula</h2>
          <p>Informa por correo a los estudiantes que el proceso de matrícula está disponible.</p>
        </div>
        {periodoVigente && (
          <span className="notificacion-matricula__badge">Periodo vigente</span>
        )}
      </div>

      {consultando ? (
        <p className="notificacion-matricula__estado" role="status">
          Verificando el periodo de matrícula…
        </p>
      ) : periodoVigente ? (
        <div className="notificacion-matricula__contenido">
          <div className="notificacion-matricula__periodo">
            <strong>{periodoVigente.periodo.anioPeriodo}</strong>
            <span>
              Matrícula habilitada del {formatearFecha(periodoVigente.fechaInicio)} al{' '}
              {formatearFecha(periodoVigente.fechaFin)}.
            </span>
          </div>
          <button
            className="notificacion-matricula__boton"
            type="button"
            disabled={enviando}
            onClick={() => void enviarNotificacion()}
          >
            {enviando ? 'Enviando correos…' : 'Enviar correo de notificación'}
          </button>
        </div>
      ) : !error ? (
        <p className="notificacion-matricula__estado">
          No hay un periodo de matrícula abierto. La opción de notificación estará disponible
          cuando inicie el próximo periodo.
        </p>
      ) : null}

      {mensaje && (
        <p className="notificacion-matricula__mensaje notificacion-matricula__mensaje--exito" role="status">
          {mensaje}
        </p>
      )}
      {error && (
        <div className="notificacion-matricula__error" role="alert">
          <p>{error}</p>
          {!periodoVigente && (
            <button type="button" disabled={consultando} onClick={() => void consultarVigencia()}>
              Reintentar consulta
            </button>
          )}
        </div>
      )}
    </section>
  )
}
