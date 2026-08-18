import api from './api'
import type { ApiResponse, PaginatedData } from '../types/api'
import type { VocabularyItem, VocabularyPayload } from '../types/vocabulary'
import type { PaginationMeta } from '../types/admin'

export const vocabularyApi = {
  getAll: async (params?: { page?: number; limit?: number; q?: string; level?: string }): Promise<{ vocabularies: VocabularyItem[]; pagination: PaginationMeta }> => {
    const page = params?.page || 1
    const limit = params?.limit || 10
    const queryParams = new URLSearchParams()
    queryParams.append('page', String(page))
    queryParams.append('limit', String(limit))
    if (params?.q) queryParams.append('q', params.q)
    if (params?.level) queryParams.append('level', params.level)

    try {
      const response = await api.get<ApiResponse<PaginatedData<VocabularyItem>> | VocabularyItem[]>(`/vocabularies?${queryParams.toString()}`)
      const resData = response.data

      let list: VocabularyItem[] = []
      let meta: PaginationMeta = { page, limit, total: 0, pages: 1 }

      if (Array.isArray(resData)) {
        list = resData
        meta.total = resData.length
      } else if ('data' in resData) {
        if (Array.isArray(resData.data)) {
          list = resData.data
          meta.total = resData.data.length
        } else if (resData.data.vocabularies && Array.isArray(resData.data.vocabularies)) {
          list = resData.data.vocabularies
          meta = {
            page: resData.data.pagination?.page || page,
            limit: resData.data.pagination?.limit || limit,
            total: resData.data.pagination?.total || list.length,
            pages: resData.data.pagination?.pages || 1,
          }
        }
      }

      return { vocabularies: list, pagination: meta }
    } catch {
      // Fallback
      const response = await api.get<ApiResponse<VocabularyItem[]>>(`/vocabulary?${queryParams.toString()}`)
      const list = response.data?.data || []
      return { vocabularies: list, pagination: { page, limit, total: list.length, pages: 1 } }
    }
  },

  getById: async (id: string): Promise<VocabularyItem> => {
    const response = await api.get<ApiResponse<VocabularyItem> | VocabularyItem>(`/vocabularies/${id}`)
    if ('data' in response.data && response.data.data) {
      return (response.data as ApiResponse<VocabularyItem>).data
    }
    return response.data as VocabularyItem
  },

  getByLektionId: async (lektionId: string): Promise<VocabularyItem[]> => {
    try {
      const response = await api.get<ApiResponse<VocabularyItem[] | PaginatedData<VocabularyItem>>>(`/vocabularies/lektion/${lektionId}`)
      if (response.data?.success) {
        if (Array.isArray(response.data.data)) return response.data.data
        if (response.data.data?.vocabularies && Array.isArray(response.data.data.vocabularies)) {
          return response.data.data.vocabularies
        }
      }
    } catch {
      // Fallback
    }

    const response = await api.get<ApiResponse<VocabularyItem[]>>(`/vocabularies?lektionId=${encodeURIComponent(lektionId)}`)
    return response.data?.data || []
  },

  create: async (payload: VocabularyPayload): Promise<VocabularyItem> => {
    const response = await api.post<ApiResponse<VocabularyItem> | VocabularyItem>('/vocabularies', payload)
    if ('data' in response.data && response.data.data) {
      return (response.data as ApiResponse<VocabularyItem>).data
    }
    return response.data as VocabularyItem
  },

  update: async (id: string, payload: Partial<VocabularyPayload>): Promise<VocabularyItem> => {
    const response = await api.put<ApiResponse<VocabularyItem> | VocabularyItem>(`/vocabularies/${id}`, payload)
    if ('data' in response.data && response.data.data) {
      return (response.data as ApiResponse<VocabularyItem>).data
    }
    return response.data as VocabularyItem
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/vocabularies/${id}`)
  },
}
