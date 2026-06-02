import axios from 'axios'
import { authApi } from './api'
import type { AuthUser } from '../types/auth'

interface AuthResult {
  token: string
  user: AuthUser
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

  register: async (name: string, email: string, password: string, passwordConfirm: string): Promise<AuthResult> => {
    console.log('Register attempt:', { name, email })
    try {
      const result = await authApi.register(name, email, password, passwordConfirm)
      console.log('Register success:', result)
      return result
    } catch (error) {
      const message = getAuthErrorMessage(error)
      console.error('Register failed:', message)
      throw new Error(message)
    }
  },
}
