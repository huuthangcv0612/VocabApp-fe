import api from './api'
import type { AuthUser, AuthResponse } from '../types/auth'

export const authApi = {
  register: async (name: string, email: string, password: string, passwordConfirm: string, username?: string) => {
    const finalUsername = username || (email ? email.split('@')[0] : '') || name.toLowerCase().replace(/\s+/g, '')
    const response = await api.post<AuthResponse<AuthUser>>('/auth/register', {
      name,
      username: finalUsername,
      email,
      password,
      passwordConfirm,
    })

    const isSuccess = response.status === 200 || response.status === 201 || response.data.success === true
    if (!isSuccess) {
      throw new Error(response.data.error || response.data.message || 'Đăng ký thất bại, vui lòng thử lại.')
    }

    const rawUser = response.data.user || (typeof response.data.data === 'object' && response.data.data !== null && 'user' in response.data.data ? (response.data.data as { user: AuthUser }).user : response.data.data)
    const user = rawUser as AuthUser
    if (!user) {
      throw new Error('Đăng ký thất bại: không nhận được dữ liệu user.')
    }

    return {
      token: response.data.token || (typeof response.data.data === 'object' && response.data.data !== null && 'token' in response.data.data ? (response.data.data as { token?: string }).token : '') || '',
      user,
    }
  },

  login: async (email: string, password: string) => {
    const response = await api.post<AuthResponse<AuthUser>>('/auth/login', {
      email,
      password,
    })

    const isSuccess = response.status === 200 || response.status === 201 || response.data.success === true
    if (!isSuccess) {
      throw new Error(response.data.error || response.data.message || 'Đăng nhập thất bại, vui lòng kiểm tra email và mật khẩu.')
    }

    const rawUser = response.data.user || (typeof response.data.data === 'object' && response.data.data !== null && 'user' in response.data.data ? (response.data.data as { user: AuthUser }).user : response.data.data)
    const user = rawUser as AuthUser
    if (!user) {
      throw new Error('Đăng nhập thất bại: không nhận được dữ liệu user.')
    }

    return {
      token: response.data.token || (typeof response.data.data === 'object' && response.data.data !== null && 'token' in response.data.data ? (response.data.data as { token?: string }).token : '') || '',
      user,
    }
  },

  verifyEmail: async (token: string) => {
    const response = await api.get<AuthResponse<null>>(`/auth/verify-email?token=${encodeURIComponent(token)}`)
    if (!response.data.success) {
      throw new Error(response.data.error || response.data.message || 'Xác thực email thất bại.')
    }
  },

  resendVerification: async (email: string) => {
    const response = await api.post<AuthResponse<null>>('/auth/resend-verification', { email })
    if (!response.data.success) {
      throw new Error(response.data.error || response.data.message || 'Không thể gửi lại email xác thực.')
    }
  },

  forgotPassword: async (email: string) => {
    const response = await api.post<AuthResponse<null>>('/auth/forgot-password', { email })
    if (!response.data.success) {
      throw new Error(response.data.error || response.data.message || 'Không thể gửi yêu cầu đặt lại mật khẩu.')
    }
  },

  validateResetToken: async (token: string) => {
    const response = await api.get<AuthResponse<null>>(`/auth/reset-password?token=${encodeURIComponent(token)}`)
    if (!response.data.success) {
      throw new Error(response.data.error || response.data.message || 'Link đặt lại mật khẩu không hợp lệ.')
    }
  },

  resetPassword: async (token: string, password: string, confirmPassword: string) => {
    const response = await api.post<AuthResponse<null>>('/auth/reset-password', {
      token,
      password,
      confirmPassword,
    })
    if (!response.data.success) {
      throw new Error(response.data.error || response.data.message || 'Không thể đặt lại mật khẩu.')
    }
  },

  changePassword: async (oldPassword: string, newPassword: string, confirmPassword: string) => {
    const response = await api.post<AuthResponse<null>>('/auth/change-password', {
      oldPassword,
      newPassword,
      confirmPassword,
    })
    if (!response.data.success) {
      throw new Error(response.data.error || response.data.message || 'Không thể đổi mật khẩu.')
    }
  },

  googleLogin: async (idToken: string) => {
    const response = await api.post<AuthResponse<AuthUser>>('/auth/google', { idToken })
    if (!response.data.success) {
      throw new Error(response.data.error || response.data.message || 'Đăng nhập Google thất bại.')
    }
    const rawUser = response.data.user || (typeof response.data.data === 'object' && response.data.data !== null && 'user' in response.data.data ? (response.data.data as { user: AuthUser }).user : response.data.data)
    const user = rawUser as AuthUser
    return {
      token: response.data.token || (typeof response.data.data === 'object' && response.data.data !== null && 'token' in response.data.data ? (response.data.data as { token?: string }).token : '') || '',
      user,
    }
  },

  getCurrentUser: async (): Promise<AuthUser> => {
    const response = await api.get<AuthResponse<AuthUser>>('/auth/me')
    if (!response.data.success) {
      throw new Error(response.data.error || response.data.message || 'Không thể lấy thông tin người dùng.')
    }
    const rawUser = response.data.user || (typeof response.data.data === 'object' && response.data.data !== null && 'user' in response.data.data ? (response.data.data as { user: AuthUser }).user : response.data.data)
    return rawUser as AuthUser
  },
}
