import api from './api'
import type { AuthUser, AuthResponse } from '../types/auth'

export const normalizeAuthUser = (resData: unknown): AuthUser => {
  const root = (resData && typeof resData === 'object' ? resData : {}) as Record<string, unknown>
  const data = (root.data && typeof root.data === 'object' && !Array.isArray(root.data) ? root.data : root) as Record<string, unknown>

  const userCandidate = (data.user && typeof data.user === 'object' ? data.user : root.user && typeof root.user === 'object' ? root.user : data) as Record<string, unknown>

  const plan =
    (typeof root.plan === 'string' && root.plan) ||
    (typeof data.plan === 'string' && data.plan) ||
    (typeof userCandidate.plan === 'string' && userCandidate.plan) ||
    (typeof root.plan_id === 'string' && root.plan_id) ||
    (typeof data.plan_id === 'string' && data.plan_id) ||
    (typeof userCandidate.plan_id === 'string' && userCandidate.plan_id) ||
    ''

  const permissions =
    (Array.isArray(root.permissions) && (root.permissions as string[])) ||
    (Array.isArray(data.permissions) && (data.permissions as string[])) ||
    (Array.isArray(userCandidate.permissions) && (userCandidate.permissions as string[])) ||
    []

  const subscription =
    (root.subscription && typeof root.subscription === 'object' && root.subscription) ||
    (data.subscription && typeof data.subscription === 'object' && data.subscription) ||
    (userCandidate.subscription && typeof userCandidate.subscription === 'object' && userCandidate.subscription) ||
    undefined

  const hasCustomPlan =
    (typeof root.hasCustomPlan === 'boolean' ? root.hasCustomPlan : undefined) ??
    (typeof data.hasCustomPlan === 'boolean' ? data.hasCustomPlan : undefined) ??
    (typeof userCandidate.hasCustomPlan === 'boolean' ? userCandidate.hasCustomPlan : undefined) ??
    (typeof plan === 'string' && plan.toUpperCase() === 'CUSTOM')

  const canManageClasses =
    (typeof root.canManageClasses === 'boolean' ? root.canManageClasses : undefined) ??
    (typeof data.canManageClasses === 'boolean' ? data.canManageClasses : undefined) ??
    (typeof userCandidate.canManageClasses === 'boolean' ? userCandidate.canManageClasses : undefined)

  const can_create_class =
    (typeof root.can_create_class === 'boolean' ? root.can_create_class : undefined) ??
    (typeof data.can_create_class === 'boolean' ? data.can_create_class : undefined) ??
    (typeof userCandidate.can_create_class === 'boolean' ? userCandidate.can_create_class : undefined)

  const isTeacher =
    (typeof root.isTeacher === 'boolean' ? root.isTeacher : undefined) ??
    (typeof data.isTeacher === 'boolean' ? data.isTeacher : undefined) ??
    (typeof userCandidate.isTeacher === 'boolean' ? userCandidate.isTeacher : undefined)

  return {
    ...userCandidate,
    plan,
    permissions,
    subscription: subscription as AuthUser['subscription'],
    hasCustomPlan,
    canManageClasses,
    can_create_class,
    isTeacher,
  } as AuthUser
}

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

    const user = normalizeAuthUser(response.data)
    if (!user || !user._id) {
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

    const user = normalizeAuthUser(response.data)
    if (!user || !user._id) {
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
    const user = normalizeAuthUser(response.data)
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
    return normalizeAuthUser(response.data)
  },
}
