import api from './api'
import type { ApiResponse } from '../types/api'
import type { TopicItem, TopicPayload } from '../types/topic'
import type { LessonItem } from '../types/lesson'

export const topicApi = {
  getAll: async (params?: { levelId?: string; q?: string }): Promise<TopicItem[]> => {
    const url = params?.levelId ? `/topics/level/${encodeURIComponent(params.levelId)}` : '/topics'
    const response = await api.get<ApiResponse<TopicItem[] | { topics: TopicItem[] }>>(url)
    const data = response.data.data
    if (Array.isArray(data)) return data
    if (data && 'topics' in data && Array.isArray(data.topics)) return data.topics
    return []
  },

  getById: async (id: string): Promise<TopicItem> => {
    const response = await api.get<ApiResponse<TopicItem>>(`/topics/${encodeURIComponent(id)}`)
    return response.data.data
  },

  getLektionsByTopic: async (topicId: string, levelId?: string): Promise<LessonItem[]> => {
    const queryParams = new URLSearchParams()
    if (levelId) queryParams.append('levelId', levelId)
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''

    const response = await api.get<ApiResponse<LessonItem[]>>(`/topics/${encodeURIComponent(topicId)}/lektions${queryString}`)
    if (Array.isArray(response.data.data)) return response.data.data
    return []
  },

  create: async (payload: TopicPayload): Promise<TopicItem> => {
    const response = await api.post<ApiResponse<TopicItem>>('/admin/topics', payload)
    return response.data.data
  },

  update: async (id: string, payload: Partial<TopicPayload>): Promise<TopicItem> => {
    const response = await api.put<ApiResponse<TopicItem>>(`/admin/topics/${encodeURIComponent(id)}`, payload)
    return response.data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/topics/${encodeURIComponent(id)}`)
  },

  reorder: async (items: Array<{ id: string; order: number }>): Promise<void> => {
    await api.put('/admin/topics/reorder', { items })
  },
}
