import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  aceptarInvitacion,
  declinarInvitacion,
  descargarDocumentoEvaluacion,
  getSesionEvaluador,
  registrarEvaluacion,
} from '../../api/evaluacionJuradoService'
import type { MomentoPendienteDto, SesionEvaluadorDto } from '../../api/evaluacionJuradoTypes'
import './EvaluacionJuradoPage.css'

interface Props { token: string }

const CONCEPTO_DOCUMENTO = 'CONCEPTO_DOCUMENTO'
const CONCEPTOS_CON_OBSERVACION_OBLIGATORIA = new Set([
  'FAVORABLE_CON_OBSERVACIONES',
  'DESFAVORABLE',
])

const isValidGrade = (value: string) =>
  /^(?:[0-4](?:[.,]\d{1,2})?|5(?:[.,]0{1,2})?)$/.test(value.trim())

type InvitationAction = 'aceptar' | 'declinar' | null

const getInvitationAction = (): InvitationAction => {
  const action = new URLSearchParams(window.location.search).get('accion')?.trim().toLowerCase()

  if (action === 'aceptar') return 'aceptar'
  if (action === 'declinar' || action === 'rechazar') return 'declinar'
  return null
}

const conceptosDocumento = [
  { codigo: 'FAVORABLE', nombre: 'Favorable', descripcion: 'El trabajo puede sustentarse sin cambios' },
  { codigo: 'FAVORABLE_CON_OBSERVACIONES', nombre: 'Favorable con observaciones', descripcion: 'Puede sustentarse después de ajustes' },
  { codigo: 'DESFAVORABLE', nombre: 'Desfavorable', descripcion: 'El trabajo no puede sustentarse' },
]

const resultadosSustentacion = [
  { codigo: 'APROBADO', nombre: 'Aprobado', descripcion: 'La sustentación cumple con los criterios de evaluación' },
  { codigo: 'NO_APROBADO', nombre: 'No aprobado', descripcion: 'La sustentación no cumple con los criterios de evaluación' },
]

const conceptosDocumentoEn = [
  { codigo: 'FAVORABLE', nombre: 'Favorable', descripcion: 'The work may proceed to defense without changes' },
  { codigo: 'FAVORABLE_CON_OBSERVACIONES', nombre: 'Favorable with observations', descripcion: 'The work may proceed to defense after revisions' },
  { codigo: 'DESFAVORABLE', nombre: 'Unfavorable', descripcion: 'The work may not proceed to defense' },
]

const resultadosSustentacionEn = [
  { codigo: 'APROBADO', nombre: 'Passed', descripcion: 'The defense meets the evaluation criteria' },
  { codigo: 'NO_APROBADO', nombre: 'Not passed', descripcion: 'The defense does not meet the evaluation criteria' },
]

type Language = 'es' | 'en'

const copy = {
  es: {
    notProvided: 'No informada', registered: 'Registrada', documentConcept: 'Concepto sobre el documento',
    defenseEvaluation: 'Evaluación de la sustentación', registeredEvaluation: 'Evaluación registrada',
    actionFailed: 'No fue posible completar la acción.', accepted: 'Has aceptado la invitación.',
    acceptFailed: 'No fue posible aceptar la invitación.', openFailed: 'No fue posible abrir el enlace.',
    downloadFailed: 'No fue posible descargar el documento.', noPending: 'No tienes una evaluación pendiente habilitada.',
    invalidGrade: 'La nota debe estar entre 0,00 y 5,00 y puede tener máximo dos decimales.',
    selectGrade: 'Selecciona una calificación.', observationsRequired: 'Ingresa las observaciones para el concepto seleccionado.',
    saved: 'Tu evaluación fue registrada correctamente.', declined: 'Has declinado la invitación.', loading: 'Consultando invitación…', cannotOpen: 'No fue posible abrir la invitación',
    publicPortal: 'Portal público', academicEvaluation: 'Evaluación académica', personalInvitation: 'Invitación personal',
    hello: 'Hola', invited: 'Has sido invitado(a) a participar como jurado evaluador.', academicWork: 'Trabajo académico',
    documentToEvaluate: 'Documento por evaluar', noStatus: 'Sin estado', student: 'Estudiante', program: 'Programa',
    deadline: 'Fecha límite', notReported: 'No informado', summary: 'Resumen', confirmParticipation: 'Confirma tu participación',
    responseHelp: 'Tu respuesta permitirá continuar oportunamente con el proceso.', acceptJury: 'Acepto ser jurado',
    cannotParticipate: 'No puedo participar', reason: 'Motivo', optional: 'opcional',
    reasonPlaceholder: 'Puedes contarnos brevemente el motivo.', confirmParticipate: 'Confirmar que participaré',
    confirmNotParticipate: 'Confirmar que no participaré', cancel: 'Cancelar', pendingEvaluation: 'Evaluación pendiente',
    download: 'Descargar documento', defense: 'Sustentación:', openLink: 'Abrir enlace', moment: 'Momento', grade: 'Nota (0 a 5)',
    gradeHelp: 'Ingresa un valor entre 0 y 5, con máximo dos decimales.', concept: 'Concepto', result: 'Resultado',
    noOptions: 'No se recibieron las opciones de calificación. Actualiza la página o contacta al coordinador.',
    selectionHelp: 'La opción seleccionada no se enviará hasta que presiones “Guardar evaluación”.', observations: 'Observaciones',
    required: 'obligatorio', save: 'Guardar evaluación', savedEvaluations: 'Evaluaciones registradas', gradePrefix: 'Nota',
    registeredOn: 'Registrada el', responseRegistered: 'Respuesta registrada', noActions: 'No tienes acciones pendientes en este momento.',
    footer: 'Universidad Industrial de Santander · Sistema de Apoyo a Procesos de Posgrado',
  },
  en: {
    notProvided: 'Not provided', registered: 'Recorded', documentConcept: 'Document assessment',
    defenseEvaluation: 'Thesis defense evaluation', registeredEvaluation: 'Recorded evaluation',
    actionFailed: 'The action could not be completed.', accepted: 'You have accepted the invitation.',
    acceptFailed: 'The invitation could not be accepted.', openFailed: 'The link could not be opened.',
    downloadFailed: 'The document could not be downloaded.', noPending: 'You do not have an enabled pending evaluation.',
    invalidGrade: 'The grade must be between 0.00 and 5.00 and may have up to two decimal places.',
    selectGrade: 'Select a rating.', observationsRequired: 'Enter observations for the selected assessment.',
    saved: 'Your evaluation was successfully recorded.', declined: 'You have declined the invitation.', loading: 'Loading invitation…', cannotOpen: 'The invitation could not be opened',
    publicPortal: 'Public portal', academicEvaluation: 'Academic evaluation', personalInvitation: 'Personal invitation',
    hello: 'Hello', invited: 'You have been invited to participate as an evaluator.', academicWork: 'Academic work',
    documentToEvaluate: 'Document to evaluate', noStatus: 'No status', student: 'Student', program: 'Program',
    deadline: 'Deadline', notReported: 'Not provided', summary: 'Abstract', confirmParticipation: 'Confirm your participation',
    responseHelp: 'Your response will allow the process to continue in a timely manner.', acceptJury: 'I accept the invitation',
    cannotParticipate: 'I cannot participate', reason: 'Reason', optional: 'optional',
    reasonPlaceholder: 'You may briefly explain the reason.', confirmParticipate: 'Confirm my participation',
    confirmNotParticipate: 'Confirm that I cannot participate', cancel: 'Cancel', pendingEvaluation: 'Pending evaluation',
    download: 'Download document', defense: 'Thesis defense:', openLink: 'Open link', moment: 'Stage', grade: 'Grade (0 to 5)',
    gradeHelp: 'Enter a value from 0 to 5, with up to two decimal places.', concept: 'Assessment', result: 'Result',
    noOptions: 'No rating options were received. Refresh the page or contact the coordinator.',
    selectionHelp: 'The selected option will not be submitted until you click “Save evaluation”.', observations: 'Observations',
    required: 'required', save: 'Save evaluation', savedEvaluations: 'Recorded evaluations', gradePrefix: 'Grade',
    registeredOn: 'Recorded on', responseRegistered: 'Response recorded', noActions: 'You have no pending actions at this time.',
    footer: 'Industrial University of Santander · Graduate Process Support System',
  },
} as const

const getLanguage = (session?: SesionEvaluadorDto | null): Language => session?.idioma?.toUpperCase() === 'EN' ? 'en' : 'es'

const formatDate = (value: string | null | undefined, language: Language) => value
  ? new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'es-CO', { dateStyle: 'long', timeStyle: value.includes('T') ? 'short' : undefined }).format(new Date(value))
  : copy[language].notProvided

const codigoLabel = (codigo?: string | null, fallback = 'Registrada') => codigo
  ? codigo.replaceAll('_', ' ').toLocaleLowerCase('es-CO').replace(/^\p{L}/u, (letter) => letter.toLocaleUpperCase('es-CO'))
  : fallback

const momentoLabel = (codigo: string | null | undefined, language: Language) => codigo === 'CONCEPTO_DOCUMENTO'
  ? copy[language].documentConcept
  : codigo === 'SUSTENTACION' ? copy[language].defenseEvaluation : codigoLabel(codigo, copy[language].registeredEvaluation)

const getMomentoCodigo = (momento: string | MomentoPendienteDto) => typeof momento === 'string'
  ? momento
  : momento.codigo

const getMomentosPendientes = (session?: SesionEvaluadorDto | null) => (session?.momentosPendientes ?? [])
  .map(getMomentoCodigo)
  .filter((codigo): codigo is string => typeof codigo === 'string' && codigo.length > 0)

const getMomentoPendiente = (session: SesionEvaluadorDto | null | undefined, codigo: string) =>
  session?.momentosPendientes.find((item): item is MomentoPendienteDto => typeof item !== 'string' && item.codigo === codigo)

const getConceptos = (session: SesionEvaluadorDto | null | undefined, language: Language) => {
  const conceptos = session?.conceptos ?? session?.catalogos?.conceptos
  return conceptos?.length ? conceptos : language === 'en' ? conceptosDocumentoEn : conceptosDocumento
}

const getResultados = (session: SesionEvaluadorDto | null | undefined, language: Language) => {
  const resultados = session?.resultados ?? session?.catalogos?.resultados
  return resultados?.length ? resultados : language === 'en' ? resultadosSustentacionEn : resultadosSustentacion
}

const EvaluacionJuradoPage = ({ token }: Props) => {
  const [requestedAction] = useState<InvitationAction>(getInvitationAction)
  const [session, setSession] = useState<SesionEvaluadorDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [evaluationError, setEvaluationError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [declining, setDeclining] = useState(false)
  const [invitationResponse, setInvitationResponse] = useState<InvitationAction>(
    requestedAction === 'declinar' ? 'declinar' : null,
  )
  const [motivo, setMotivo] = useState('')
  const [selectedMoment, setSelectedMoment] = useState('')
  const [selection, setSelection] = useState('')
  const [nota, setNota] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const language = getLanguage(session)
  const t = copy[language]

  const run = useCallback(async (action: () => Promise<SesionEvaluadorDto>, message: string) => {
    setWorking(true); setError(null); setNotice(null)
    try { setSession(await action()); setNotice(message) }
    catch (caught) { setError(caught instanceof Error ? caught.message : t.actionFailed) }
    finally { setWorking(false) }
  }, [t.actionFailed])

  useEffect(() => {
    let active = true

    getSesionEvaluador(token).then(async (data) => {
      if (!active) return
      if (data.puedeResponderInvitacion && requestedAction === 'aceptar') {
        setWorking(true)
        try {
          const updated = await aceptarInvitacion(token)
          if (active) { setSession(updated); setNotice(copy[getLanguage(updated)].accepted) }
        } catch (caught) {
          if (active) { setSession(data); setError(caught instanceof Error ? caught.message : copy[getLanguage(data)].acceptFailed) }
        } finally { if (active) setWorking(false) }
        return
      }
      setSession(data)
      if (data.puedeResponderInvitacion && requestedAction === 'declinar') setDeclining(true)
    })
      .catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : copy.es.openFailed) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [requestedAction, token])

  const submitInvitationResponse = (event: FormEvent) => {
    event.preventDefault()
    if (invitationResponse === 'aceptar') {
      void run(() => aceptarInvitacion(token), t.accepted)
      return
    }
    if (invitationResponse === 'declinar') {
      void run(() => declinarInvitacion(token, motivo.trim() || undefined), t.declined)
    }
  }

  const download = async () => {
    setWorking(true); setError(null)
    try {
      const file = await descargarDocumentoEvaluacion(token)
      const bytes = Uint8Array.from(atob(file.contenidoBase64), (char) => char.charCodeAt(0))
      const url = URL.createObjectURL(new Blob([bytes], { type: file.mimeType }))
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = file.nombreArchivo; anchor.click()
      URL.revokeObjectURL(url)
    } catch (caught) { setError(caught instanceof Error ? caught.message : t.downloadFailed) }
    finally { setWorking(false) }
  }

  const submitEvaluation = (event: FormEvent) => {
    event.preventDefault()
    setEvaluationError(null)
    const pendingMoments = getMomentosPendientes(session)
    const moment = selectedMoment || pendingMoments[0] || ''
    if (!session?.puedeEvaluar || !moment || !pendingMoments.includes(moment)) {
      setEvaluationError(t.noPending)
      return
    }
    const pendingMoment = getMomentoPendiente(session, moment)
    const numeric = pendingMoment?.requiereNota === true
    const options = moment === CONCEPTO_DOCUMENTO
      ? getConceptos(session, language)
      : getResultados(session, language)
    const observacionesRequeridas = moment === CONCEPTO_DOCUMENTO
      && CONCEPTOS_CON_OBSERVACION_OBLIGATORIA.has(selection)
    if (numeric && !isValidGrade(nota)) { setEvaluationError(t.invalidGrade); return }
    if (!numeric && options.length && !selection) { setEvaluationError(t.selectGrade); return }
    if (observacionesRequeridas && !observaciones.trim()) { setEvaluationError(t.observationsRequired); return }
    void run(() => registrarEvaluacion(token, {
      momentoCodigo: moment,
      conceptoCodigo: moment === CONCEPTO_DOCUMENTO ? selection : null,
      resultadoCodigo: !numeric && moment === 'SUSTENTACION' ? selection : null,
      nota: numeric ? Number(nota.replace(',', '.')) : null,
      observaciones: observaciones.trim() || null,
    }), t.saved)
  }

  if (loading) return <main className="evaluation-state"><div className="evaluation-spinner" /><p>{t.loading}</p></main>
  if (!session) return <main className="evaluation-state"><section className="evaluation-message evaluation-message--error"><h1>{t.cannotOpen}</h1><p>{error}</p></section></main>

  const pendingMoments = getMomentosPendientes(session)
  const canEvaluate = session.puedeEvaluar && pendingMoments.length > 0
  const activeMoment = selectedMoment && pendingMoments.includes(selectedMoment)
    ? selectedMoment
    : pendingMoments[0] ?? ''
  const activePendingMoment = getMomentoPendiente(session, activeMoment)
  const numeric = activePendingMoment?.requiereNota === true
  const options = activeMoment === CONCEPTO_DOCUMENTO
    ? getConceptos(session, language)
    : getResultados(session, language)
  const observacionesRequeridas = activeMoment === CONCEPTO_DOCUMENTO
    && CONCEPTOS_CON_OBSERVACION_OBLIGATORIA.has(selection)
  const usesConfirmableInvitationResponse = requestedAction === 'declinar'

  return <div className="evaluation-page">
    <header className="evaluation-header"><img src="/brand/LOGO UIS_PNG.png" alt="Universidad Industrial de Santander" /><div><span>{t.publicPortal}</span><strong>{t.academicEvaluation}</strong></div></header>
    <main className="evaluation-content">
      <section className="evaluation-welcome"><p className="evaluation-eyebrow">{t.personalInvitation}</p><h1>{t.hello}, {session.nombreJurado}</h1><p>{t.invited}</p></section>
      {error && <div className="evaluation-alert evaluation-alert--error" role="alert">{error}</div>}
      {notice && <div className="evaluation-alert evaluation-alert--success" role="status">{notice}</div>}
      <section className="evaluation-card evaluation-work"><div className="evaluation-card__heading"><div><p className="evaluation-eyebrow">{t.academicWork}</p><h2>{session.titulo || session.documentoNombre || t.documentToEvaluate}</h2></div><span className="evaluation-chip">{codigoLabel(session.estadoInvitacion, t.noStatus)}</span></div>
        <dl className="evaluation-details"><div><dt>{t.student}</dt><dd>{session.nombreEstudiante || t.notReported}</dd></div><div><dt>{t.program}</dt><dd>{session.programa || t.notReported}</dd></div><div><dt>{t.deadline}</dt><dd>{formatDate(session.fechaLimiteEvaluacion, language)}</dd></div></dl>
        {session.resumen && <div className="evaluation-summary"><h3>{t.summary}</h3><p>{session.resumen}</p></div>}
      </section>
      {session.puedeResponderInvitacion && <section className="evaluation-card"><h2>{t.confirmParticipation}</h2><p>{t.responseHelp}</p><div className="evaluation-actions">
        <button type="button" className={usesConfirmableInvitationResponse ? `evaluation-button evaluation-button--choice${invitationResponse === 'aceptar' ? ' evaluation-button--choice-selected' : ''}` : 'evaluation-button evaluation-button--primary'} aria-pressed={usesConfirmableInvitationResponse ? invitationResponse === 'aceptar' : undefined} disabled={working} onClick={() => usesConfirmableInvitationResponse ? setInvitationResponse('aceptar') : void run(() => aceptarInvitacion(token), t.accepted)}>{t.acceptJury}</button>
        <button type="button" className={usesConfirmableInvitationResponse ? `evaluation-button evaluation-button--choice${invitationResponse === 'declinar' ? ' evaluation-button--choice-selected evaluation-button--choice-danger' : ''}` : 'evaluation-button evaluation-button--secondary'} aria-pressed={usesConfirmableInvitationResponse ? invitationResponse === 'declinar' : undefined} disabled={working} onClick={() => usesConfirmableInvitationResponse ? setInvitationResponse('declinar') : setDeclining(true)}>{t.cannotParticipate}</button>
      </div>
        {usesConfirmableInvitationResponse && <form className="evaluation-decline" onSubmit={submitInvitationResponse}>
          {invitationResponse === 'declinar' && <label>{t.reason} <span>({t.optional})</span><textarea rows={3} value={motivo} onChange={(event) => setMotivo(event.target.value)} placeholder={t.reasonPlaceholder} /></label>}
          <div><button className={invitationResponse === 'declinar' ? 'evaluation-button evaluation-button--danger' : 'evaluation-button evaluation-button--primary'} disabled={working || !invitationResponse}>{invitationResponse === 'aceptar' ? t.confirmParticipate : t.confirmNotParticipate}</button></div>
        </form>}
        {!usesConfirmableInvitationResponse && declining && <form className="evaluation-decline" onSubmit={(event) => { event.preventDefault(); void run(() => declinarInvitacion(token, motivo.trim() || undefined), t.declined) }}><label>{t.reason} <span>({t.optional})</span><textarea rows={3} value={motivo} onChange={(event) => setMotivo(event.target.value)} placeholder={t.reasonPlaceholder} /></label><div><button className="evaluation-button evaluation-button--danger" disabled={working}>{t.confirmNotParticipate}</button><button type="button" className="evaluation-link" onClick={() => setDeclining(false)}>{t.cancel}</button></div></form>}
      </section>}
      {canEvaluate && activeMoment && <section className="evaluation-card"><div className="evaluation-card__heading"><div><p className="evaluation-eyebrow">{t.pendingEvaluation}</p><h2>{momentoLabel(activeMoment, language)}</h2></div>{session.documentoDisponible && <button className="evaluation-button evaluation-button--download" disabled={working} onClick={() => void download()}>{t.download}</button>}</div>
        {session.fechaSustentacion && <div className="evaluation-schedule"><strong>{t.defense}</strong> {formatDate(session.fechaSustentacion, language)} · {session.modalidadSustentacion}{session.lugarSustentacion ? ` · ${session.lugarSustentacion}` : ''}{session.enlaceSustentacion && <> · <a href={session.enlaceSustentacion} target="_blank" rel="noreferrer">{t.openLink}</a></>}</div>}
        <form className="evaluation-form" onSubmit={submitEvaluation}>{pendingMoments.length > 1 && <label>{t.moment}<select value={activeMoment} onChange={(event) => { setSelectedMoment(event.target.value); setSelection('') }}>{pendingMoments.map((item) => <option key={item} value={item}>{momentoLabel(item, language)}</option>)}</select></label>}
          {numeric ? <label>{t.grade}<input type="text" inputMode="decimal" value={nota} onChange={(event) => { setNota(event.target.value); setEvaluationError(null) }} aria-describedby="evaluation-grade-help evaluation-form-error" required /><small id="evaluation-grade-help">{t.gradeHelp}</small></label> : options.length > 0 ? <fieldset className="evaluation-concepts" aria-describedby="evaluation-save-help"><legend>{activeMoment === CONCEPTO_DOCUMENTO ? t.concept : t.result}</legend>{options.map((item) => <label key={item.codigo} className={selection === item.codigo ? 'evaluation-concept evaluation-concept--selected' : 'evaluation-concept'}><input type="radio" name="concepto" value={item.codigo} checked={selection === item.codigo} onChange={(event) => { setSelection(event.target.value); setEvaluationError(null) }} required /><span><strong>{item.nombre}</strong>{item.descripcion && <small>{item.descripcion}</small>}</span></label>)}</fieldset> : <p className="evaluation-alert evaluation-alert--error">{t.noOptions}</p>}
          {!numeric && options.length > 0 && <p id="evaluation-save-help" className="evaluation-form__help">{t.selectionHelp}</p>}
          <label>{t.observations} <span>({observacionesRequeridas ? t.required : t.optional})</span><textarea rows={5} value={observaciones} onChange={(event) => { setObservaciones(event.target.value); setEvaluationError(null) }} required={observacionesRequeridas} /></label>{evaluationError && <div id="evaluation-form-error" className="evaluation-alert evaluation-alert--error" role="alert">{evaluationError}</div>}<button type="submit" className="evaluation-button evaluation-button--primary" disabled={working || (!numeric && options.length === 0)}>{t.save}</button></form>
      </section>}
      {session.evaluaciones?.length > 0 && <section className="evaluation-card"><h2>{t.savedEvaluations}</h2><div className="evaluation-records">{session.evaluaciones.map((item, index) => {
        const momento = item.momentoCodigo ?? item.momento
        const calificacion = item.conceptoNombre ?? item.resultadoNombre ?? item.conceptoCodigo
          ?? item.resultadoCodigo ?? item.concepto ?? item.resultado
        return <article key={item.id ?? `${momento ?? 'evaluacion'}-${index}`}>
          <strong>{item.momentoNombre || momentoLabel(momento, language)}</strong>
          <span>{calificacion ? codigoLabel(calificacion) : item.nota != null ? `${t.gradePrefix}: ${item.nota}` : t.registered}</span>
          {item.observaciones && <p>{item.observaciones}</p>}
          {item.fechaRegistro && <time dateTime={item.fechaRegistro}>{t.registeredOn} {formatDate(item.fechaRegistro, language)}</time>}
        </article>
      })}</div></section>}
      {!session.puedeResponderInvitacion && !canEvaluate && !session.evaluaciones?.length && <section className="evaluation-card evaluation-complete"><h2>{t.responseRegistered}</h2><p>{t.noActions}</p></section>}
    </main><footer className="evaluation-footer">{t.footer}</footer>
  </div>
}

export default EvaluacionJuradoPage
