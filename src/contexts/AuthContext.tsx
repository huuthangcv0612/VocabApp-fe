import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { authService } from '../services/authService'
import { setAuthToken, clearAuthToken } from '../services/api'
import type { AuthUser } from '../types/auth'

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isAccountLocked: boolean
  accountLockReason?: string
  accountLockedAt?: string
  loading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  register: (name: string, email: string, password: string, passwordConfirm: string, username?: string) => Promise<void>
  logout: () => void
  verifyEmail: (token: string) => Promise<string>
  resendVerification: (email: string) => Promise<string>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<void>
  changePassword: (oldPassword: string, newPassword: string, confirmPassword: string) => Promise<void>
  googleLogin: (idToken: string) => Promise<AuthUser>
  updateProfileState: (updatedUser: AuthUser) => void
  refreshUser: () => Promise<AuthUser>
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

  useEffect(() => {
    const handleAccountLocked = (e: Event) => {
      const customEvent = e as CustomEvent<{
        message?: string
        code?: string
        lockReason?: string
        lockedAt?: string
        data?: { lockReason?: string; lockedAt?: string }
      }>
      const detail = customEvent.detail
      const reason =
        detail?.data?.lockReason ||
        detail?.lockReason ||
        (detail?.message && detail.message !== 'Tài khoản của bạn đã bị khóa' ? detail.message : undefined)
      const lockedTime = detail?.data?.lockedAt || detail?.lockedAt

      setUser((prevUser) => {
        const baseUser = prevUser || getInitialUser()
        if (!baseUser) return null

        const finalReason = reason || baseUser.lockReason
        const finalLockedAt = lockedTime || baseUser.lockedAt

        if (
          baseUser.status === 'locked' &&
          baseUser.lockReason === finalReason &&
          baseUser.lockedAt === finalLockedAt
        ) {
          return baseUser
        }

        const updatedUser: AuthUser = {
          ...baseUser,
          status: 'locked',
          lockReason: finalReason,
          lockedAt: finalLockedAt,
        }
        localStorage.setItem(STORAGE_USER, JSON.stringify(updatedUser))
        return updatedUser
      })
    }

    window.addEventListener('account:locked', handleAccountLocked)
    return () => window.removeEventListener('account:locked', handleAccountLocked)
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    console.log('AuthContext login called:', { email })
    const response = await authService.login(email, password)
    console.log('AuthContext login response:', response)
    setToken(response.token)
    setUser(response.user)
    localStorage.setItem(STORAGE_TOKEN, response.token)
    localStorage.setItem(STORAGE_USER, JSON.stringify(response.user))
    console.log('AuthContext login saved to storage')
    return response.user
  }, [])

  const register = useCallback(async (name: string, email: string, password: string, passwordConfirm: string, username?: string) => {
    console.log('AuthContext register called:', { name, email, username })
    await authService.register(name, email, password, passwordConfirm, username)
    console.log('AuthContext register completed without auto-login')
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(STORAGE_TOKEN)
    localStorage.removeItem(STORAGE_USER)
    clearAuthToken()
  }, [])

  const verifyEmail = useCallback(async (verifyToken: string): Promise<string> => {
    return await authService.verifyEmail(verifyToken)
  }, [])

  const resendVerification = useCallback(async (email: string): Promise<string> => {
    return await authService.resendVerification(email)
  }, [])

  const forgotPassword = useCallback(async (email: string) => {
    await authService.forgotPassword(email)
  }, [])

  const resetPassword = useCallback(async (resetToken: string, password: string, confirmPassword: string) => {
    await authService.resetPassword(resetToken, password, confirmPassword)
  }, [])

  const changePassword = useCallback(async (oldPassword: string, newPassword: string, confirmPassword: string) => {
    await authService.changePassword(oldPassword, newPassword, confirmPassword)
  }, [])

  const googleLogin = useCallback(async (idToken: string): Promise<AuthUser> => {
    const response = await authService.googleLogin(idToken)
    setToken(response.token)
    setUser(response.user)
    localStorage.setItem(STORAGE_TOKEN, response.token)
    localStorage.setItem(STORAGE_USER, JSON.stringify(response.user))
    return response.user
  }, [])

  const updateProfileState = useCallback((updatedUser: AuthUser) => {
    setUser(updatedUser)
    localStorage.setItem(STORAGE_USER, JSON.stringify(updatedUser))
  }, [])

  const refreshUser = useCallback(async (): Promise<AuthUser> => {
    const currentUser = await authService.getCurrentUser()
    setUser(currentUser)
    localStorage.setItem(STORAGE_USER, JSON.stringify(currentUser))
    return currentUser
  }, [])

  const isAccountLocked = user?.status === 'locked'
  const accountLockReason = user?.lockReason
  const accountLockedAt = user?.lockedAt

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isAccountLocked,
      accountLockReason,
      accountLockedAt,
      loading,
      login,
      register,
      logout,
      verifyEmail,
      resendVerification,
      forgotPassword,
      resetPassword,
      changePassword,
      googleLogin,
      updateProfileState,
      refreshUser,
    }),
    [
      loading,
      token,
      user,
      isAccountLocked,
      accountLockReason,
      accountLockedAt,
      login,
      register,
      logout,
      verifyEmail,
      resendVerification,
      forgotPassword,
      resetPassword,
      changePassword,
      googleLogin,
      updateProfileState,
      refreshUser,
    ],
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
