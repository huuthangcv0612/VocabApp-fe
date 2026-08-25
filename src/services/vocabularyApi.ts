import api from './api'
import type { ApiResponse } from '../types/api'
import type { VocabularyItem, VocabularyPayload } from '../types/vocabulary'
import type { PaginationMeta } from '../types/admin'

export const vocabularyApi = {
  getAll: async (params?: { page?: number; limit?: number; q?: string; level?: string; search?: string; type?: string; lektionId?: string; difficultyLevel?: string }): Promise<{ vocabularies: VocabularyItem[]; pagination: PaginationMeta }> => {
    const page = params?.page || 1
    const limit = params?.limit || 200
    const queryParams = new URLSearchParams()
    queryParams.append('page', String(page))
    queryParams.append('limit', String(limit))
    if (params?.q || params?.search) queryParams.append('search', params.q || params.search || '')
    if (params?.level || params?.difficultyLevel) queryParams.append('difficultyLevel', params.level || params.difficultyLevel || '')
    if (params?.type) queryParams.append('type', params.type)
    if (params?.lektionId) queryParams.append('lektionId', params.lektionId)

    const response = await api.get<ApiResponse<{ vocabularies: VocabularyItem[]; pagination?: PaginationMeta } | VocabularyItem[]>>(`/vocabularies?${queryParams.toString()}`)
    const resData = response.data.data

    if (Array.isArray(resData)) {
      return {
        vocabularies: resData,
        pagination: { page, limit, total: resData.length, pages: 1 },
      }
    }

    return {
      vocabularies: resData?.vocabularies || [],
      pagination: resData?.pagination || { page, limit, total: resData?.vocabularies?.length || 0, pages: 1 },
    }
  },

  getById: async (id: string): Promise<VocabularyItem> => {
    const response = await api.get<ApiResponse<VocabularyItem>>(`/vocabularies/${encodeURIComponent(id)}`)
    return response.data.data
  },

  getByLektionId: async (lektionId: string): Promise<VocabularyItem[]> => {
    const response = await api.get<ApiResponse<VocabularyItem[] | { vocabularies: VocabularyItem[] }>>(`/vocabularies/lektion/${encodeURIComponent(lektionId)}`)
    const resData = response.data.data
    if (Array.isArray(resData)) return resData
    if (resData && 'vocabularies' in resData && Array.isArray(resData.vocabularies)) return resData.vocabularies
    return []
  },

  search: async (query: string): Promise<VocabularyItem[]> => {
    const response = await api.get<ApiResponse<VocabularyItem[] | { vocabularies: VocabularyItem[] }>>(`/vocabularies/search/${encodeURIComponent(query)}`)
    const resData = response.data.data
    if (Array.isArray(resData)) return resData
    if (resData && 'vocabularies' in resData && Array.isArray(resData.vocabularies)) return resData.vocabularies
    return []
  },

  create: async (payload: VocabularyPayload): Promise<VocabularyItem> => {
    const response = await api.post<ApiResponse<{ vocabulary: VocabularyItem } | VocabularyItem>>('/admin/vocabularies', payload)
    const resData = response.data.data
    if ('vocabulary' in resData) return resData.vocabulary
    return resData
  },

  update: async (id: string, payload: Partial<VocabularyPayload>): Promise<VocabularyItem> => {
    const response = await api.put<ApiResponse<{ vocabulary: VocabularyItem } | VocabularyItem>>(`/admin/vocabularies/${encodeURIComponent(id)}`, payload)
    const resData = response.data.data
    if ('vocabulary' in resData) return resData.vocabulary
    return resData
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/vocabularies/${encodeURIComponent(id)}`)
  },
}
