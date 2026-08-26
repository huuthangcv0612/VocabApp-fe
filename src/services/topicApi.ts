import api from './api'
import type { ApiResponse } from '../types/api'
import type { TopicItem, TopicPayload } from '../types/topic'
import type { LessonItem } from '../types/lesson'

const extractTopicArray = (responseData: unknown): TopicItem[] => {
  if (!responseData) return []
  if (Array.isArray(responseData)) return responseData as TopicItem[]

  const resObj = responseData as Record<string, unknown>
  const dataObj = resObj.data || resObj

  if (Array.isArray(dataObj)) return dataObj as TopicItem[]

  if (dataObj && typeof dataObj === 'object') {
    const dataRecord = dataObj as Record<string, unknown>
    if (Array.isArray(dataRecord.topics)) return dataRecord.topics as TopicItem[]
    if (Array.isArray(dataRecord.data)) return dataRecord.data as TopicItem[]
  }

  if (Array.isArray(resObj.topics)) return resObj.topics as TopicItem[]
  return []
}

export const topicApi = {
  getAll: async (params?: { levelId?: string; q?: string }): Promise<TopicItem[]> => {
    try {
      const url = params?.levelId ? `/topics/level/${encodeURIComponent(params.levelId)}` : '/topics'
      const response = await api.get<unknown>(url)
      const items = extractTopicArray(response.data)
      if (items.length > 0 || params?.levelId) return items

      const adminResponse = await api.get<unknown>('/admin/topics')
      return extractTopicArray(adminResponse.data)
    } catch {
      try {
        const fallbackUrl = params?.levelId ? `/topics/level/${encodeURIComponent(params.levelId)}` : '/admin/topics'
        const response = await api.get<unknown>(fallbackUrl)
        return extractTopicArray(response.data)
      } catch {
        return []
      }
    }
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
