import api from './api'
import type { ApiResponse } from '../types/api'
import type { UnitItem, UnitPayload } from '../types/unit'

export const unitApi = {
  getAll: async (params?: { topicId?: string; q?: string }): Promise<UnitItem[]> => {
    const url = params?.topicId ? `/units/topic/${encodeURIComponent(params.topicId)}` : '/units'
    const response = await api.get<ApiResponse<UnitItem[] | { units: UnitItem[] }>>(url)
    const data = response.data.data
    if (Array.isArray(data)) return data
    if (data && 'units' in data && Array.isArray(data.units)) return data.units
    return []
  },

  getById: async (id: string): Promise<UnitItem> => {
    const response = await api.get<ApiResponse<UnitItem>>(`/units/${encodeURIComponent(id)}`)
    return response.data.data
  },

  create: async (payload: UnitPayload): Promise<UnitItem> => {
    const response = await api.post<ApiResponse<UnitItem>>('/admin/units', payload)
    return response.data.data
  },

  update: async (id: string, payload: Partial<UnitPayload>): Promise<UnitItem> => {
    const response = await api.put<ApiResponse<UnitItem>>(`/admin/units/${encodeURIComponent(id)}`, payload)
    return response.data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/units/${encodeURIComponent(id)}`)
  },

  reorder: async (items: Array<{ id: string; order: number }>): Promise<void> => {
    await api.put('/admin/units/reorder', { items })
  },
}
