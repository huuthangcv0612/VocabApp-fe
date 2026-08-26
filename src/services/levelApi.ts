import api from './api'
import type { ApiResponse } from '../types/api'
import type { LevelItem, LevelPayload } from '../types/level'

const extractLevelArray = (responseData: unknown): LevelItem[] => {
  if (!responseData) return []
  if (Array.isArray(responseData)) return responseData as LevelItem[]

  const resObj = responseData as Record<string, unknown>
  const dataObj = resObj.data || resObj

  if (Array.isArray(dataObj)) return dataObj as LevelItem[]

  if (dataObj && typeof dataObj === 'object') {
    const dataRecord = dataObj as Record<string, unknown>
    if (Array.isArray(dataRecord.levels)) return dataRecord.levels as LevelItem[]
    if (Array.isArray(dataRecord.data)) return dataRecord.data as LevelItem[]
  }

  if (Array.isArray(resObj.levels)) return resObj.levels as LevelItem[]
  return []
}

export const levelApi = {
  getAll: async (): Promise<LevelItem[]> => {
    try {
      const response = await api.get<unknown>('/levels')
      return extractLevelArray(response.data)
    } catch {
      return []
    }
  },

  getById: async (id: string): Promise<LevelItem> => {
    const response = await api.get<ApiResponse<{ level: LevelItem } | LevelItem>>(`/levels/${encodeURIComponent(id)}`)
    const resData = response.data.data
    if (resData && typeof resData === 'object' && 'level' in resData) {
      return resData.level
    }
    return resData as LevelItem
  },

  getByName: async (name: string): Promise<LevelItem> => {
    return levelApi.getById(name)
  },

  create: async (payload: LevelPayload): Promise<LevelItem> => {
    const response = await api.post<ApiResponse<{ level: LevelItem } | LevelItem>>('/levels', payload)
    const resData = response.data.data
    if (resData && typeof resData === 'object' && 'level' in resData) {
      return resData.level
    }
    return resData as LevelItem
  },

  update: async (id: string, payload: Partial<LevelPayload>): Promise<LevelItem> => {
    const response = await api.put<ApiResponse<{ level: LevelItem } | LevelItem>>(`/levels/${encodeURIComponent(id)}`, payload)
    const resData = response.data.data
    if (resData && typeof resData === 'object' && 'level' in resData) {
      return resData.level
    }
    return resData as LevelItem
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/levels/${encodeURIComponent(id)}`)
  },
}
