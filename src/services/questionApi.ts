import api from './api'
import type { ApiResponse } from '../types/api'
import type { QuestionItem, QuestionsResponseData } from '../types/admin'

export const questionApi = {
  getQuestions: async (params?: { page?: number; limit?: number; q?: string; skill?: string; level?: string }): Promise<QuestionsResponseData> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', String(params.page))
    if (params?.limit) queryParams.append('limit', String(params.limit))
    if (params?.q) queryParams.append('q', params.q)
    if (params?.skill) queryParams.append('skill', params.skill)
    if (params?.level) queryParams.append('level', params.level)

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''
    const response = await api.get<ApiResponse<QuestionsResponseData>>(`/questions${queryString}`)
    return response.data.data
  },

  getQuestion: async (id: string): Promise<QuestionItem> => {
    const response = await api.get<ApiResponse<QuestionItem>>(`/questions/${encodeURIComponent(id)}`)
    return response.data.data
  },
}
