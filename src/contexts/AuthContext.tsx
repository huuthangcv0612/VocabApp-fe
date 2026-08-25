import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { authService } from '../services/authService'
import { setAuthToken, clearAuthToken } from '../services/api'
import type { AuthUser } from '../types/auth'

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  register: (name: string, email: string, password: string, passwordConfirm: string) => Promise<void>
  logout: () => void
  verifyEmail: (token: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, password: string, passwordConfirm: string) => Promise<void>
  changePassword: (oldPassword: string, newPassword: string, confirmPassword: string) => Promise<void>
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setAuthToken(token)
  }, [token])

  useEffect(() => {
    const restoreSession = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
        localStorage.setItem(STORAGE_USER, JSON.stringify(currentUser))
      } catch {
        setToken(null)
        setUser(null)
        clearAuthToken()
        localStorage.removeItem(STORAGE_TOKEN)
        localStorage.removeItem(STORAGE_USER)
      } finally {
        setLoading(false)
      }
    }

    void restoreSession()
  }, [token])

  useEffect(() => {
    const handleLogout = () => {
      setToken(null)
      setUser(null)
      clearAuthToken()
    }

    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [])

  const login = async (email: string, password: string): Promise<AuthUser> => {
    console.log('AuthContext login called:', { email })
    const response = await authService.login(email, password)
    console.log('AuthContext login response:', response)
    setToken(response.token)
    setUser(response.user)
    localStorage.setItem(STORAGE_TOKEN, response.token)
    localStorage.setItem(STORAGE_USER, JSON.stringify(response.user))
    console.log('AuthContext login saved to storage')
    return response.user
  }

  const register = async (name: string, email: string, password: string, passwordConfirm: string) => {
    console.log('AuthContext register called:', { name, email })
    await authService.register(name, email, password, passwordConfirm)
    console.log('AuthContext register completed without auto-login')
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(STORAGE_TOKEN)
    localStorage.removeItem(STORAGE_USER)
    clearAuthToken()
  }

  const verifyEmail = async (verifyToken: string) => {
    await authService.verifyEmail(verifyToken)
  }

  const forgotPassword = async (email: string) => {
    await authService.forgotPassword(email)
  }

  const resetPassword = async (resetToken: string, password: string, passwordConfirm: string) => {
    await authService.resetPassword(resetToken, password, passwordConfirm)
  }

  const changePassword = async (oldPassword: string, newPassword: string, confirmPassword: string) => {
    await authService.changePassword(oldPassword, newPassword, confirmPassword)
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      loading,
      login,
      register,
      logout,
      verifyEmail,
      forgotPassword,
      resetPassword,
      changePassword,
    }),
    [loading, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
