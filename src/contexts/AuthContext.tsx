import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { authService } from '../services/authService'
import { setAuthToken, clearAuthToken } from '../services/api'
import type { AuthUser } from '../types/auth'

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, passwordConfirm: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_TOKEN = 'vocabapp_token'
const STORAGE_USER = 'vocabapp_user'

const getInitialToken = () => localStorage.getItem(STORAGE_TOKEN)
const getInitialUser = (): AuthUser | null => {
  const value = localStorage.getItem(STORAGE_USER)
  if (!value) return null
  try {
    return JSON.parse(value) as AuthUser
  } catch {
    return null
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(getInitialToken())
  const [user, setUser] = useState<AuthUser | null>(getInitialUser())

  useEffect(() => {
    setAuthToken(token)
  }, [token])

  const login = async (email: string, password: string) => {
    console.log('AuthContext login called:', { email })
    const response = await authService.login(email, password)
    console.log('AuthContext login response:', response)
    setToken(response.token)
    setUser(response.user)
    localStorage.setItem(STORAGE_TOKEN, response.token)
    localStorage.setItem(STORAGE_USER, JSON.stringify(response.user))
    console.log('AuthContext login saved to storage')
  }

  const register = async (name: string, email: string, password: string, passwordConfirm: string) => {
    console.log('AuthContext register called:', { name, email })
    const response = await authService.register(name, email, password, passwordConfirm)
    console.log('AuthContext register response:', response)
    setToken(response.token)
    setUser(response.user)
    localStorage.setItem(STORAGE_TOKEN, response.token)
    localStorage.setItem(STORAGE_USER, JSON.stringify(response.user))
    console.log('AuthContext register saved to storage')
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(STORAGE_TOKEN)
    localStorage.removeItem(STORAGE_USER)
    clearAuthToken()
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
