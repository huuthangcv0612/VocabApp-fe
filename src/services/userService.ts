import api from './api'
import type { ApiResponse } from '../types/api'
import type { AuthUser } from '../types/auth'

export const userService = {
  getProfile: async (): Promise<AuthUser> => {
    const response = await api.get<ApiResponse<AuthUser | { user: AuthUser }>>('/users/profile')
    const resData = response.data.data
    if (resData && typeof resData === 'object' && 'user' in resData) {
      return resData.user
    }
    return resData as AuthUser
  },

  updateProfile: async (payload: Partial<AuthUser>): Promise<AuthUser> => {
    const response = await api.put<ApiResponse<AuthUser | { user: AuthUser }>>('/users/profile', payload)
    const resData = response.data.data
    if (resData && typeof resData === 'object' && 'user' in resData) {
      return resData.user
    }
    return resData as AuthUser
  },
}
