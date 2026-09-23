import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  aceptarInvitacion,
  declinarInvitacion,
  descargarDocumentoEvaluacion,
  getSesionEvaluador,
  registrarEvaluacion,
} from '../../api/evaluacionJuradoService'
import type { SesionEvaluadorDto } from '../../api/evaluacionJuradoTypes'
import './EvaluacionJuradoPage.css'

interface Props { token: string }

const CONCEPTO_DOCUMENTO = 'CONCEPTO_DOCUMENTO'

const conceptosDocumento = [
  { codigo: 'FAVORABLE', nombre: 'Favorable', descripcion: 'El trabajo puede sustentarse sin cambios' },
  { codigo: 'FAVORABLE_CON_OBSERVACIONES', nombre: 'Favorable con observaciones', descripcion: 'Puede sustentarse después de ajustes' },
  { codigo: 'DESFAVORABLE', nombre: 'Desfavorable', descripcion: 'El trabajo no puede sustentarse' },
]

const formatDate = (value?: string | null) => value
  ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeStyle: value.includes('T') ? 'short' : undefined }).format(new Date(value))
  : 'No informada'

const codigoLabel = (codigo?: string | null, fallback = 'Registrada') => codigo
  ? codigo.replaceAll('_', ' ').toLocaleLowerCase('es-CO').replace(/^\p{L}/u, (letter) => letter.toLocaleUpperCase('es-CO'))
  : fallback

const momentoLabel = (codigo?: string | null) => codigo === 'CONCEPTO_DOCUMENTO'
  ? 'Concepto sobre el documento'
  : codigo === 'SUSTENTACION' ? 'Evaluación de la sustentación' : codigoLabel(codigo, 'Evaluación registrada')

const getConceptos = (session?: SesionEvaluadorDto | null) => {
  const conceptos = session?.conceptos ?? session?.catalogos?.conceptos
  return conceptos?.length ? conceptos : conceptosDocumento
}

const EvaluacionJuradoPage = ({ token }: Props) => {
  const [session, setSession] = useState<SesionEvaluadorDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [declining, setDeclining] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [selectedMoment, setSelectedMoment] = useState('')
  const [selection, setSelection] = useState('')
  const [nota, setNota] = useState('')
  const [observaciones, setObservaciones] = useState('')

  const run = useCallback(async (action: () => Promise<SesionEvaluadorDto>, message: string) => {
    setWorking(true); setError(null); setNotice(null)
    try { setSession(await action()); setNotice(message) }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'No fue posible completar la acción.') }
    finally { setWorking(false) }
  }, [])

  useEffect(() => {
    let active = true
    getSesionEvaluador(token).then(async (data) => {
      if (!active) return
      const action = new URLSearchParams(window.location.search).get('accion')?.toLowerCase()
      if (data.puedeResponderInvitacion && action === 'aceptar') {
        setWorking(true)
        try {
          const updated = await aceptarInvitacion(token)
          if (active) { setSession(updated); setNotice('Has aceptado la invitación.') }
        } catch (caught) {
          if (active) { setSession(data); setError(caught instanceof Error ? caught.message : 'No fue posible aceptar la invitación.') }
        } finally { if (active) setWorking(false) }
        return
      }
      setSession(data)
      if (data.puedeResponderInvitacion && (action === 'declinar' || action === 'rechazar')) setDeclining(true)
    })
      .catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : 'No fue posible abrir el enlace.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [token])

  const download = async () => {
    setWorking(true); setError(null)
    try {
      const file = await descargarDocumentoEvaluacion(token)
      const bytes = Uint8Array.from(atob(file.contenidoBase64), (char) => char.charCodeAt(0))
      const url = URL.createObjectURL(new Blob([bytes], { type: file.mimeType }))
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = file.nombreArchivo; anchor.click()
      URL.revokeObjectURL(url)
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'No fue posible descargar el documento.') }
    finally { setWorking(false) }
  }

  const submitEvaluation = (event: FormEvent) => {
    event.preventDefault()
    const pendingMoments = session?.momentosPendientes ?? []
    const moment = selectedMoment || pendingMoments[0] || ''
    if (!session?.puedeEvaluar || !moment || !pendingMoments.includes(moment)) {
      setError('No tienes una evaluación pendiente habilitada.')
      return
    }
    const numeric = moment !== CONCEPTO_DOCUMENTO && session?.tipoSolicitudCodigo === 'CAND_DOCTORAL'
    const options = moment === CONCEPTO_DOCUMENTO
      ? getConceptos(session)
      : (session?.resultados ?? session?.catalogos?.resultados ?? [])
    if (numeric && (Number(nota) < 0 || Number(nota) > 5 || nota === '')) { setError('La nota debe estar entre 0,0 y 5,0.'); return }
    if (!numeric && options.length && !selection) { setError('Selecciona una calificación.'); return }
    void run(() => registrarEvaluacion(token, {
      momentoCodigo: moment,
      conceptoCodigo: moment === CONCEPTO_DOCUMENTO ? selection : null,
      resultadoCodigo: !numeric && moment === 'SUSTENTACION' ? selection : null,
      nota: numeric ? Number(nota) : null,
      observaciones: observaciones.trim() || null,
    }), 'Tu evaluación fue registrada correctamente.')
  }

  if (loading) return <main className="evaluation-state"><div className="evaluation-spinner" /><p>Consultando invitación…</p></main>
  if (!session) return <main className="evaluation-state"><section className="evaluation-message evaluation-message--error"><h1>No fue posible abrir la invitación</h1><p>{error}</p></section></main>

  const pendingMoments = session.momentosPendientes ?? []
  const canEvaluate = session.puedeEvaluar && pendingMoments.length > 0
  const activeMoment = selectedMoment && pendingMoments.includes(selectedMoment)
    ? selectedMoment
    : pendingMoments[0] ?? ''
  const numeric = activeMoment !== CONCEPTO_DOCUMENTO && session.tipoSolicitudCodigo === 'CAND_DOCTORAL'
  const options = activeMoment === CONCEPTO_DOCUMENTO
    ? getConceptos(session)
    : (session.resultados ?? session.catalogos?.resultados ?? [])

  return <div className="evaluation-page">
    <header className="evaluation-header"><img src="/brand/LOGO UIS_PNG.png" alt="Universidad Industrial de Santander" /><div><span>Portal público</span><strong>Evaluación académica</strong></div></header>
    <main className="evaluation-content">
      <section className="evaluation-welcome"><p className="evaluation-eyebrow">Invitación personal</p><h1>Hola, {session.nombreJurado}</h1><p>Has sido invitado(a) a participar como jurado evaluador.</p></section>
      {error && <div className="evaluation-alert evaluation-alert--error" role="alert">{error}</div>}
      {notice && <div className="evaluation-alert evaluation-alert--success" role="status">{notice}</div>}
      <section className="evaluation-card evaluation-work"><div className="evaluation-card__heading"><div><p className="evaluation-eyebrow">Trabajo académico</p><h2>{session.titulo || session.documentoNombre || 'Documento por evaluar'}</h2></div><span className="evaluation-chip">{codigoLabel(session.estadoInvitacion, 'Sin estado')}</span></div>
        <dl className="evaluation-details"><div><dt>Estudiante</dt><dd>{session.nombreEstudiante || 'No informado'}</dd></div><div><dt>Programa</dt><dd>{session.programa || 'No informado'}</dd></div><div><dt>Fecha límite</dt><dd>{formatDate(session.fechaLimiteEvaluacion)}</dd></div></dl>
        {session.resumen && <div className="evaluation-summary"><h3>Resumen</h3><p>{session.resumen}</p></div>}
      </section>
      {session.puedeResponderInvitacion && <section className="evaluation-card"><h2>Confirma tu participación</h2><p>Tu respuesta permitirá continuar oportunamente con el proceso.</p><div className="evaluation-actions"><button className="evaluation-button evaluation-button--primary" disabled={working} onClick={() => void run(() => aceptarInvitacion(token), 'Has aceptado la invitación.')}>Acepto ser jurado</button><button className="evaluation-button evaluation-button--secondary" disabled={working} onClick={() => setDeclining(true)}>No puedo participar</button></div>
        {declining && <form className="evaluation-decline" onSubmit={(event) => { event.preventDefault(); void run(() => declinarInvitacion(token, motivo.trim() || undefined), 'Has declinado la invitación.') }}><label>Motivo <span>(opcional)</span><textarea rows={3} value={motivo} onChange={(event) => setMotivo(event.target.value)} placeholder="Puedes contarnos brevemente el motivo." /></label><div><button className="evaluation-button evaluation-button--danger" disabled={working}>Confirmar que no participaré</button><button type="button" className="evaluation-link" onClick={() => setDeclining(false)}>Cancelar</button></div></form>}
      </section>}
      {canEvaluate && activeMoment && <section className="evaluation-card"><div className="evaluation-card__heading"><div><p className="evaluation-eyebrow">Evaluación pendiente</p><h2>{momentoLabel(activeMoment)}</h2></div>{session.documentoDisponible && <button className="evaluation-button evaluation-button--download" disabled={working} onClick={() => void download()}>Descargar documento</button>}</div>
        {session.fechaSustentacion && <div className="evaluation-schedule"><strong>Sustentación:</strong> {formatDate(session.fechaSustentacion)} · {session.modalidadSustentacion}{session.lugarSustentacion ? ` · ${session.lugarSustentacion}` : ''}{session.enlaceSustentacion && <> · <a href={session.enlaceSustentacion} target="_blank" rel="noreferrer">Abrir enlace</a></>}</div>}
        <form className="evaluation-form" onSubmit={submitEvaluation}>{pendingMoments.length > 1 && <label>Momento<select value={activeMoment} onChange={(event) => { setSelectedMoment(event.target.value); setSelection('') }}>{pendingMoments.map((item) => <option key={item} value={item}>{momentoLabel(item)}</option>)}</select></label>}
          {numeric ? <label>Nota (0,0 a 5,0)<input type="number" min="0" max="5" step="0.1" value={nota} onChange={(event) => setNota(event.target.value)} required /></label> : options.length > 0 ? <fieldset className="evaluation-concepts"><legend>{activeMoment === CONCEPTO_DOCUMENTO ? 'Concepto' : 'Resultado'}</legend>{options.map((item) => <label key={item.codigo} className={selection === item.codigo ? 'evaluation-concept evaluation-concept--selected' : 'evaluation-concept'}><input type="radio" name="concepto" value={item.codigo} checked={selection === item.codigo} onChange={(event) => setSelection(event.target.value)} required /><span><strong>{item.nombre}</strong>{item.descripcion && <small>{item.descripcion}</small>}</span></label>)}</fieldset> : <p className="evaluation-alert evaluation-alert--error">No se recibieron las opciones de calificación. Actualiza la página o contacta al coordinador.</p>}
          <label>Observaciones <span>(opcional)</span><textarea rows={5} value={observaciones} onChange={(event) => setObservaciones(event.target.value)} /></label><button className="evaluation-button evaluation-button--primary" disabled={working || (!numeric && options.length === 0)}>Enviar evaluación</button></form>
      </section>}
      {session.evaluaciones?.length > 0 && <section className="evaluation-card"><h2>Evaluaciones registradas</h2><div className="evaluation-records">{session.evaluaciones.map((item, index) => {
        const momento = item.momentoCodigo ?? item.momento
        const calificacion = item.conceptoNombre ?? item.resultadoNombre ?? item.conceptoCodigo
          ?? item.resultadoCodigo ?? item.concepto ?? item.resultado
        return <article key={item.id ?? `${momento ?? 'evaluacion'}-${index}`}>
          <strong>{item.momentoNombre || momentoLabel(momento)}</strong>
          <span>{calificacion ? codigoLabel(calificacion) : item.nota != null ? `Nota: ${item.nota}` : 'Registrada'}</span>
          {item.observaciones && <p>{item.observaciones}</p>}
          {item.fechaRegistro && <time dateTime={item.fechaRegistro}>Registrada el {formatDate(item.fechaRegistro)}</time>}
        </article>
      })}</div></section>}
      {!session.puedeResponderInvitacion && !canEvaluate && !session.evaluaciones?.length && <section className="evaluation-card evaluation-complete"><h2>Respuesta registrada</h2><p>No tienes acciones pendientes en este momento.</p></section>}
    </main><footer className="evaluation-footer">Universidad Industrial de Santander · Sistema de Apoyo a Procesos de Posgrado</footer>
  </div>
}

export default EvaluacionJuradoPage
