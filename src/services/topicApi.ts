import api from './api'
import type { ApiResponse, PaginatedData } from '../types/api'
import type { TopicItem, TopicPayload } from '../types/topic'
import type { LessonItem } from '../types/lesson'

export const topicApi = {
  getAll: async (params?: { levelId?: string; q?: string }): Promise<TopicItem[]> => {
    try {
      const queryParams = new URLSearchParams()
      if (params?.levelId) queryParams.append('levelId', params.levelId)
      if (params?.q) queryParams.append('q', params.q)
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''

      const response = await api.get<ApiResponse<TopicItem[] | PaginatedData<TopicItem>> | TopicItem[]>(`/topics${queryString}`)
      const resData = response.data

      if (Array.isArray(resData)) return resData
      if ('data' in resData) {
        if (Array.isArray(resData.data)) return resData.data
        if (resData.data.topics && Array.isArray(resData.data.topics)) return resData.data.topics
        if (resData.data.docs && Array.isArray(resData.data.docs)) return resData.data.docs
      }
      return []
    } catch (err) {
      console.error('Failed to fetch topics:', err)
      return []
    }
  },

  getById: async (id: string): Promise<TopicItem> => {
    const response = await api.get<ApiResponse<TopicItem> | TopicItem>(`/topics/${id}`)
    if ('data' in response.data && response.data.data) {
      return (response.data as ApiResponse<TopicItem>).data
    }
    return response.data as TopicItem
  },

  getLektionsByTopic: async (topicId: string, levelId?: string): Promise<LessonItem[]> => {
    try {
      const queryParams = new URLSearchParams()
      if (levelId) queryParams.append('levelId', levelId)
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''

      const response = await api.get<ApiResponse<LessonItem[] | { lektions: LessonItem[] }> | LessonItem[]>(`/topics/${topicId}/lektions${queryString}`)
      const resData = response.data

      if (Array.isArray(resData)) return resData
      if ('data' in resData) {
        if (Array.isArray(resData.data)) return resData.data
        if ('lektions' in resData.data && Array.isArray(resData.data.lektions)) return resData.data.lektions
      }
    } catch {
      // Fallback endpoint
      try {
        const response = await api.get<ApiResponse<LessonItem[]>>(`/lektions?topicId=${topicId}${levelId ? `&levelId=${levelId}` : ''}`)
        if ('data' in response.data && Array.isArray(response.data.data)) {
          return response.data.data
        }
      } catch (err) {
        console.error('Failed to fetch lektions by topic:', err)
      }
    }
    return []
  },

  create: async (payload: TopicPayload): Promise<TopicItem> => {
    const response = await api.post<ApiResponse<TopicItem> | TopicItem>('/topics', payload)
    if ('data' in response.data && response.data.data) {
      return (response.data as ApiResponse<TopicItem>).data
    }
    return response.data as TopicItem
  },

  update: async (id: string, payload: Partial<TopicPayload>): Promise<TopicItem> => {
    const response = await api.put<ApiResponse<TopicItem> | TopicItem>(`/topics/${id}`, payload)
    if ('data' in response.data && response.data.data) {
      return (response.data as ApiResponse<TopicItem>).data
    }
    return response.data as TopicItem
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/topics/${id}`)
  },
}
