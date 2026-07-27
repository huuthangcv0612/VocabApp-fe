import axios from 'axios'
import { authApi } from './api'
import type { AuthUser } from '../types/auth'

interface AuthResult {
  token: string
  user: AuthUser
}

interface AuthStateResponse {
  success: boolean
  token?: string
  user?: AuthUser
  data?: AuthUser
  error?: string
  message?: string
}

const getAuthErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    console.error('Auth Axios Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    })
    const responseData = error.response?.data as { message?: string; error?: string } | undefined
    return responseData?.message || responseData?.error || error.message || 'Đăng ký thất bại'
  }

  console.error('Auth Error:', error)
  return error instanceof Error ? error.message : 'Đăng ký thất bại'
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResult> => {
    console.log('Login attempt:', { email })
    try {
      const result = await authApi.login(email, password)
      console.log('Login success:', result)
      return result
    } catch (error) {
      const message = getAuthErrorMessage(error)
      console.error('Login failed:', message)
      throw new Error(message)
    }
  },

  register: async (name: string, email: string, password: string, passwordConfirm: string): Promise<void> => {
    console.log('Register attempt:', { name, email })
    try {
      await authApi.register(name, email, password, passwordConfirm)
      console.log('Register success')
    } catch (error) {
      const message = getAuthErrorMessage(error)
      console.error('Register failed:', message)
      throw new Error(message)
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
      const response = await authApi.getCurrentUser() as AuthStateResponse
      const user = response.user ?? response.data
      if (!user) {
        throw new Error('Không thể lấy thông tin người dùng.')
      }
      return user
    } catch (error) {
      throw new Error(getAuthErrorMessage(error))
    }
  },
}
