import api from './api'
import { authApi, normalizeAuthUser } from './authApi'
import type { AuthUser } from '../types/auth'

export const userService = {
  getProfile: async (): Promise<AuthUser> => {
    return await authApi.getCurrentUser()
  },

  updateProfile: async (payload: Partial<AuthUser>): Promise<AuthUser> => {
    const response = await api.put('/users/profile', payload)
    return normalizeAuthUser(response.data)
  },
}
