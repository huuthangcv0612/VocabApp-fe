import axios from 'axios'
import { authApi } from './api'
import type { AuthUser } from '../types/auth'

interface AuthResult {
  token: string
  user: AuthUser
}

const getAuthErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as { message?: string; error?: string } | undefined
    return responseData?.message || responseData?.error || error.message || 'Thao tác thất bại'
  }
  return error instanceof Error ? error.message : 'Thao tác thất bại'
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResult> => {
    try {
      return await authApi.login(email, password)
    } catch (error) {
      throw new Error(getAuthErrorMessage(error))
    }
  },

  register: async (name: string, email: string, password: string, passwordConfirm: string): Promise<void> => {
    try {
      await authApi.register(name, email, password, passwordConfirm)
    } catch (error) {
      throw new Error(getAuthErrorMessage(error))
    }
  },

  verifyEmail: async (token: string): Promise<void> => {
    try {
      await authApi.verifyEmail(token)
    } catch (error) {
      throw new Error(getAuthErrorMessage(error))
    }
  },

  forgotPassword: async (email: string): Promise<void> => {
    try {
      await authApi.forgotPassword(email)
    } catch (error) {
      throw new Error(getAuthErrorMessage(error))
    }
  },

  resetPassword: async (token: string, password: string, passwordConfirm: string): Promise<void> => {
    try {
      await authApi.resetPassword(token, password, passwordConfirm)
    } catch (error) {
      throw new Error(getAuthErrorMessage(error))
    }
  },

  changePassword: async (oldPassword: string, newPassword: string, confirmPassword: string): Promise<void> => {
    try {
      await authApi.changePassword(oldPassword, newPassword, confirmPassword)
    } catch (error) {
      throw new Error(getAuthErrorMessage(error))
    }
  },

  getCurrentUser: async (): Promise<AuthUser> => {
    try {
      return await authApi.getCurrentUser()
    } catch (error) {
      throw new Error(getAuthErrorMessage(error))
    }
  },
}
