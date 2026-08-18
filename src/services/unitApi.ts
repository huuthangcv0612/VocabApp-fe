import api from './api'
import type { ApiResponse, PaginatedData } from '../types/api'
import type { UnitItem, UnitPayload } from '../types/unit'

export const unitApi = {
  getAll: async (params?: { topicId?: string; q?: string }): Promise<UnitItem[]> => {
    try {
      const queryParams = new URLSearchParams()
      if (params?.topicId) queryParams.append('topicId', params.topicId)
      if (params?.q) queryParams.append('q', params.q)
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''

      const response = await api.get<ApiResponse<UnitItem[] | PaginatedData<UnitItem>> | UnitItem[]>(`/units${queryString}`)
      const resData = response.data

      if (Array.isArray(resData)) return resData
      if ('data' in resData) {
        if (Array.isArray(resData.data)) return resData.data
        if (resData.data.units && Array.isArray(resData.data.units)) return resData.data.units
        if (resData.data.docs && Array.isArray(resData.data.docs)) return resData.data.docs
      }
      return []
    } catch (err) {
      console.error('Failed to fetch units:', err)
      return []
    }
  },

  getById: async (id: string): Promise<UnitItem> => {
    const response = await api.get<ApiResponse<UnitItem> | UnitItem>(`/units/${id}`)
    if ('data' in response.data && response.data.data) {
      return (response.data as ApiResponse<UnitItem>).data
    }
    return response.data as UnitItem
  },

  create: async (payload: UnitPayload): Promise<UnitItem> => {
    const response = await api.post<ApiResponse<UnitItem> | UnitItem>('/units', payload)
    if ('data' in response.data && response.data.data) {
      return (response.data as ApiResponse<UnitItem>).data
    }
    return response.data as UnitItem
  },

  update: async (id: string, payload: Partial<UnitPayload>): Promise<UnitItem> => {
    const response = await api.put<ApiResponse<UnitItem> | UnitItem>(`/units/${id}`, payload)
    if ('data' in response.data && response.data.data) {
      return (response.data as ApiResponse<UnitItem>).data
    }
    return response.data as UnitItem
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/units/${id}`)
  },
}
