import api from './api'
import type { AuthUser, AuthResponse } from '../types/auth'

export const authApi = {
  register: async (name: string, email: string, password: string, passwordConfirm: string) => {
    const response = await api.post<AuthResponse<AuthUser>>('/auth/register', {
      name,
      email,
      password,
      passwordConfirm,
    })

    const isSuccess = response.status === 200 || response.status === 201 || response.data.success === true
    if (!isSuccess) {
      throw new Error(response.data.error || response.data.message || 'Đăng ký thất bại, vui lòng thử lại.')
    }

    const user = response.data.user ?? response.data.data
    if (!user) {
      throw new Error('Đăng ký thất bại: không nhận được dữ liệu user.')
    }

    return {
      token: response.data.token || '',
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

    const user = response.data.user ?? response.data.data
    if (!user) {
      throw new Error('Đăng nhập thất bại: không nhận được dữ liệu user.')
    }

    return {
      token: response.data.token || '',
      user,
    }
  },

  verifyEmail: async (token: string) => {
    const response = await api.get<AuthResponse<null>>(`/auth/verify-email?token=${encodeURIComponent(token)}`)
    if (!response.data.success) {
      throw new Error(response.data.error || response.data.message || 'Xác thực email thất bại.')
    }
  },

  forgotPassword: async (email: string) => {
    const response = await api.post<AuthResponse<null>>('/auth/forgot-password', { email })
    if (!response.data.success) {
      throw new Error(response.data.error || response.data.message || 'Không thể gửi yêu cầu đặt lại mật khẩu.')
    }
  },

  resetPassword: async (token: string, password: string, passwordConfirm: string) => {
    const response = await api.post<AuthResponse<null>>('/auth/reset-password', {
      token,
      password,
      confirmPassword: passwordConfirm,
      passwordConfirm,
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

  getCurrentUser: async () => {
    const response = await api.get<AuthResponse<AuthUser>>('/auth/me')
    if (!response.data.success) {
      throw new Error(response.data.error || response.data.message || 'Không thể lấy thông tin người dùng.')
    }
    return response.data.data || response.data.user || (response.data as unknown as AuthUser)
  },
}
