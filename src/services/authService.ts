import axios from 'axios'
import { authApi } from './authApi'
import type { AuthUser } from '../types/auth'

interface AuthResult {
  token: string
  user: AuthUser
}

export class AuthApiError extends Error {
  status?: number
  code?: string

  constructor(message: string, status?: number, code?: string) {
    super(message)
    this.name = 'AuthApiError'
    this.status = status
    this.code = code
  }
}

export const getAuthErrorInfo = (error: unknown): { message: string; status?: number } => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as { message?: string; error?: string } | undefined
    const message = responseData?.message || responseData?.error || error.message || 'Thao tác thất bại'
    return { message, status: error.response?.status }
  }
  return {
    message: error instanceof Error ? error.message : 'Thao tác thất bại',
    status: undefined,
  }
}

export const getAuthErrorMessage = (error: unknown): string => {
  return getAuthErrorInfo(error).message
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResult> => {
    try {
      return await authApi.login(email, password)
    } catch (error) {
      const { message, status } = getAuthErrorInfo(error)
      throw new AuthApiError(message, status)
    }
  },

  register: async (name: string, email: string, password: string, passwordConfirm: string, username?: string): Promise<{ message?: string }> => {
    try {
      return await authApi.register(name, email, password, passwordConfirm, username)
    } catch (error) {
      const { message, status } = getAuthErrorInfo(error)
      throw new AuthApiError(message, status)
    }
  },

  verifyEmail: async (token: string): Promise<string> => {
    try {
      const res = await authApi.verifyEmail(token)
      return res.message || 'Xác thực email thành công. Bạn có thể đăng nhập ngay bây giờ.'
    } catch (error) {
      const { message, status } = getAuthErrorInfo(error)
      throw new AuthApiError(message, status)
    }
  },

  resendVerification: async (email: string): Promise<string> => {
    try {
      const res = await authApi.resendVerification(email)
      return res.message || 'Đã gửi lại email xác nhận. Vui lòng kiểm tra hộp thư của bạn.'
    } catch (error) {
      const { message, status } = getAuthErrorInfo(error)
      throw new AuthApiError(message, status)
    }
  },

  forgotPassword: async (email: string): Promise<void> => {
    try {
      await authApi.forgotPassword(email)
    } catch (error) {
      const { message, status } = getAuthErrorInfo(error)
      throw new AuthApiError(message, status)
    }
  },

  validateResetToken: async (token: string): Promise<void> => {
    try {
      await authApi.validateResetToken(token)
    } catch (error) {
      const { message, status } = getAuthErrorInfo(error)
      throw new AuthApiError(message, status)
    }
  },

  resetPassword: async (token: string, password: string, confirmPassword: string): Promise<void> => {
    try {
      await authApi.resetPassword(token, password, confirmPassword)
    } catch (error) {
      const { message, status } = getAuthErrorInfo(error)
      throw new AuthApiError(message, status)
    }
  },

  changePassword: async (oldPassword: string, newPassword: string, confirmPassword: string): Promise<void> => {
    try {
      await authApi.changePassword(oldPassword, newPassword, confirmPassword)
    } catch (error) {
      const { message, status } = getAuthErrorInfo(error)
      throw new AuthApiError(message, status)
    }
  },

  googleLogin: async (idToken: string): Promise<AuthResult> => {
    try {
      return await authApi.googleLogin(idToken)
    } catch (error) {
      const { message, status } = getAuthErrorInfo(error)
      throw new AuthApiError(message, status)
    }
  },

  getCurrentUser: async (): Promise<AuthUser> => {
    try {
      return await authApi.getCurrentUser()
    } catch (error) {
      const { message, status } = getAuthErrorInfo(error)
      throw new AuthApiError(message, status)
    }
  },
}
