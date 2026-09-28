import { AspiranteLayout } from './components'
import { useAuth } from './context/Auth'
import { AspiranteDocumentosPage } from './pages/AspiranteDocumentos'
import { AspiranteLoginPage } from './pages/AspiranteLogin'
import { EvaluacionJuradoPage } from './pages/EvaluacionJurado'

const getEvaluationToken = () => {
  const match = window.location.pathname.match(/^\/evaluacion\/([^/]+)\/?$/)
  return match ? decodeURIComponent(match[1]) : null
}

function App() {
  const { session } = useAuth()
  const evaluationToken = getEvaluationToken()

  if (evaluationToken) {
    return <EvaluacionJuradoPage token={evaluationToken} />
  }

  if (!session || session.kind !== 'ASPIRANTE') {
    return <AspiranteLoginPage />
  }

  return (
    <AspiranteLayout>
      <AspiranteDocumentosPage />
    </AspiranteLayout>
  )
}

export default App
