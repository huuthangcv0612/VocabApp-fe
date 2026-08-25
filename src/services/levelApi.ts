import api from './api'
import type { ApiResponse } from '../types/api'
import type { LevelItem, LevelPayload } from '../types/level'

export const levelApi = {
  getAll: async (): Promise<LevelItem[]> => {
    const response = await api.get<ApiResponse<LevelItem[]>>('/levels')
    if (Array.isArray(response.data.data)) return response.data.data
    return []
  },

  getById: async (id: string): Promise<LevelItem> => {
    const response = await api.get<ApiResponse<LevelItem>>(`/levels/${encodeURIComponent(id)}`)
    return response.data.data
  },

  getByName: async (name: string): Promise<LevelItem> => {
    const response = await api.get<ApiResponse<LevelItem>>(`/levels/name/${encodeURIComponent(name)}`)
    return response.data.data
  },

  create: async (payload: LevelPayload): Promise<LevelItem> => {
    const response = await api.post<ApiResponse<LevelItem>>('/admin/levels', payload)
    return response.data.data
  },

  update: async (id: string, payload: Partial<LevelPayload>): Promise<LevelItem> => {
    const response = await api.put<ApiResponse<LevelItem>>(`/admin/levels/${encodeURIComponent(id)}`, payload)
    return response.data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/levels/${encodeURIComponent(id)}`)
  },
}
