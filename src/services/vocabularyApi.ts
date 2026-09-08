import api from './api'
import { aiService } from './aiService'
import type { ApiResponse } from '../types/api'
import type { VocabularyItem, VocabularyPayload } from '../types/vocabulary'
import type { PaginationMeta } from '../types/admin'

export const vocabularyApi = {
  getAll: async (params?: { page?: number; limit?: number; q?: string; level_id?: string; level?: string; search?: string; type?: string; difficultyLevel?: string }): Promise<{ vocabularies: VocabularyItem[]; pagination: PaginationMeta }> => {
    const page = params?.page || 1
    const limit = params?.limit || 20
    const queryParams = new URLSearchParams()
    queryParams.append('page', String(page))
    queryParams.append('limit', String(limit))
    
    const levelIdVal = params?.level_id || (params?.level?.length === 24 ? params.level : undefined)
    if (levelIdVal) queryParams.append('level_id', levelIdVal)
    if (params?.q || params?.search) queryParams.append('search', params.q || params.search || '')
    if (params?.difficultyLevel || (params?.level && params.level.length !== 24)) {
      queryParams.append('difficultyLevel', params.difficultyLevel || params.level || '')
    }
    if (params?.type) queryParams.append('type', params.type)

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

  getByLevelId: async (levelId: string): Promise<VocabularyItem[]> => {
    const res = await vocabularyApi.getAll({ level_id: levelId, limit: 100 })
    return res.vocabularies
  },

  getByLektionId: async (lektionId: string): Promise<VocabularyItem[]> => {
    const res = await vocabularyApi.getAll({ level_id: lektionId, limit: 100 })
    return res.vocabularies
  },

  search: async (query: string): Promise<VocabularyItem[]> => {
    const res = await vocabularyApi.getAll({ search: query, limit: 50 })
    return res.vocabularies
  },

  create: async (payload: VocabularyPayload): Promise<VocabularyItem> => {
    const response = await api.post<ApiResponse<{ vocabulary: VocabularyItem } | VocabularyItem>>('/vocabularies', payload)
    const resData = response.data.data
    if (resData && typeof resData === 'object' && 'vocabulary' in resData) {
      return resData.vocabulary
    }
    return resData as VocabularyItem
  },

  update: async (id: string, payload: Partial<VocabularyPayload>): Promise<VocabularyItem> => {
    const response = await api.put<ApiResponse<{ vocabulary: VocabularyItem } | VocabularyItem>>(`/vocabularies/${encodeURIComponent(id)}`, payload)
    const resData = response.data.data
    if (resData && typeof resData === 'object' && 'vocabulary' in resData) {
      return resData.vocabulary
    }
    return resData as VocabularyItem
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/vocabularies/${encodeURIComponent(id)}`)
  },

  getSentenceFeedback: async (sentence: string): Promise<string> => {
    const data = await aiService.checkGermanSentence(sentence)
    const { correct, corrected, errors } = data
    let feedback = ''

    if (correct) {
      feedback = 'Tuyệt vời! Câu của bạn hoàn toàn chính xác. 🎉'
    } else {
      feedback = 'Câu của bạn có một số lỗi:\n\n'
      if (corrected) {
        feedback += `Câu đúng: "${corrected}"\n\n`
      }
      if (errors && errors.length > 0) {
        feedback += `Lỗi phát hiện: ${errors.join(', ')}\n\n`
      }
      feedback += 'Hãy thử lại với câu đúng nhé!'
    }

    return feedback
  },
}
