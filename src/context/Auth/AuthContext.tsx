import { createContext, useCallback, useMemo, useState } from 'react'
import { consultaInfoAspirante } from '../../api/aspiranteAuthService'
import { mapAspiranteInfoToSession } from '../../api/aspiranteAuthMappers'
import { clearSession, getSession, saveSession } from '../../modules/auth/session/sessionStore'
import type { AspiranteLoginParams, AuthContextValue, AuthSession } from './types'

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const ESTADOS_SIN_ACCESO = new Set(['APROBADO', 'RECHAZADO'])

const validarAccesoAspirante = (estadoInscripcion: string) => {
  const estadoNormalizado = estadoInscripcion.trim().toUpperCase()

  if (ESTADOS_SIN_ACCESO.has(estadoNormalizado)) {
    throw new Error(
      `No puedes ingresar al módulo de aspirantes porque tu inscripción se encuentra en estado ${estadoNormalizado}.`,
    )
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSessionState] = useState<AuthSession | null>(() => {
    clearSession()
    return getSession()
  })

  const loginAspirante = useCallback(async (params: AspiranteLoginParams) => {
    const info = await consultaInfoAspirante(params)
    validarAccesoAspirante(info.estadoInscripcion)
    const authenticatedSession = mapAspiranteInfoToSession(info)
    setSessionState(authenticatedSession)
    saveSession(authenticatedSession)
  }, [])

  const logout = useCallback(() => {
    setSessionState(null)
    clearSession()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      token: session?.accessToken ?? null,
      isAuthenticated: Boolean(session),
      loginAspirante,
      logout,
    }),
    [session, loginAspirante, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
