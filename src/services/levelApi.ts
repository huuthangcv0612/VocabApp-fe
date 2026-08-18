import api from './api'
import type { ApiResponse } from '../types/api'
import type { LevelItem, LevelPayload } from '../types/level'

export const levelApi = {
  getAll: async (): Promise<LevelItem[]> => {
    try {
      const response = await api.get<ApiResponse<LevelItem[]> | LevelItem[]>('/levels')
      const resData = response.data

      if (Array.isArray(resData)) return resData
      if ('data' in resData && Array.isArray(resData.data)) return resData.data
      return []
    } catch (err) {
      console.error('Failed to fetch levels:', err)
      throw err
    }
  },

  getById: async (id: string): Promise<LevelItem> => {
    const response = await api.get<ApiResponse<LevelItem> | LevelItem>(`/levels/${id}`)
    if ('data' in response.data && response.data.data) {
      return (response.data as ApiResponse<LevelItem>).data
    }
    return response.data as LevelItem
  },

  getByName: async (name: string): Promise<LevelItem> => {
    const response = await api.get<ApiResponse<LevelItem> | LevelItem>(`/levels/name/${name}`)
    if ('data' in response.data && response.data.data) {
      return (response.data as ApiResponse<LevelItem>).data
    }
    return response.data as LevelItem
  },

  create: async (payload: LevelPayload): Promise<LevelItem> => {
    const response = await api.post<ApiResponse<LevelItem> | LevelItem>('/levels', payload)
    if ('data' in response.data && response.data.data) {
      return (response.data as ApiResponse<LevelItem>).data
    }
    return response.data as LevelItem
  },

  update: async (id: string, payload: Partial<LevelPayload>): Promise<LevelItem> => {
    const response = await api.put<ApiResponse<LevelItem> | LevelItem>(`/levels/${id}`, payload)
    if ('data' in response.data && response.data.data) {
      return (response.data as ApiResponse<LevelItem>).data
    }
    return response.data as LevelItem
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/levels/${id}`)
  },
}
