import api from './api'
import type { ApiResponse, PaginatedData } from '../types/api'
import type { LessonItem, LessonDetailData, LessonDetailResponse } from '../types/lesson'

export const lessonApi = {
  getAll: async (params?: { unitId?: string; topicId?: string; q?: string }): Promise<LessonItem[]> => {
    try {
      const queryParams = new URLSearchParams()
      if (params?.unitId) queryParams.append('unitId', params.unitId)
      if (params?.topicId) queryParams.append('topicId', params.topicId)
      if (params?.q) queryParams.append('q', params.q)
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''

      const response = await api.get<ApiResponse<LessonItem[] | PaginatedData<LessonItem>> | LessonItem[]>(`/lektions${queryString}`)
      const resData = response.data

      if (Array.isArray(resData)) return resData
      if ('data' in resData) {
        if (Array.isArray(resData.data)) return resData.data
        if (resData.data.lessons && Array.isArray(resData.data.lessons)) return resData.data.lessons
        if (resData.data.docs && Array.isArray(resData.data.docs)) return resData.data.docs
      }
      return []
    } catch (err) {
      console.error('Failed to fetch lessons:', err)
      return []
    }
  },

  getById: async (id: string): Promise<LessonDetailData> => {
    const response = await api.get<ApiResponse<LessonDetailResponse> | LessonDetailResponse>(`/lektions/${id}`)
    const resData = 'data' in response.data && response.data.data ? response.data.data : (response.data as LessonDetailResponse)

    const rawLesson = resData.lesson || (resData as unknown as LessonItem)
    const rawPreviewVocabs = resData.preview?.vocabularies || resData.vocabularies || []
    const rawExercises = resData.exercises || []

    const vocabularies = rawPreviewVocabs.map((v, idx) => ({
      _id: v._id || `pv_${idx}`,
      vocabularyId: v.vocabularyId || v._id,
      word: v.word,
      meaning: v.meaning,
      gender: v.gender,
      phonetic: v.phonetic,
      order: v.order || idx + 1,
      is_new: v.is_new ?? true,
      level: v.level,
      type: v.type,
    }))

    const exercises = rawExercises.map((ex, idx) => {
      const contentObj = ex.content || {}
      const answerObj = ex.answer || {}
      const exType = ex.type || 'multiple_choice'

      let displayQuestion = ex.question || contentObj.question || contentObj.prompt || contentObj.sentence || 'Exercise Question'
      if (exType === 'sentence_arrangement' && !displayQuestion) {
        displayQuestion = `Sắp xếp câu: ${contentObj.words ? contentObj.words.join(' / ') : 'Các từ rời rạc'}`
      }

      return {
        _id: ex._id || `ex_${idx}`,
        order: ex.order || idx + 1,
        type: exType,
        vocabularyId: ex.vocabularyId,
        vocabularyName: ex.vocabularyName || 'Tổng hợp',
        xp: ex.xp || (exType === 'sentence_arrangement' ? 15 : exType === 'multiple_choice' ? 5 : 10),
        status: ex.status || 'active',
        question: displayQuestion,
        content: contentObj,
        answer: answerObj,
        options: ex.options || (contentObj.options ? contentObj.options.map((optText: string, oIdx: number) => ({
          text: optText,
          isCorrect: answerObj.correct_option_index === oIdx,
        })) : []),
        explanation: ex.explanation || '',
      }
    })

    return { lesson: rawLesson, vocabularies, exercises }
  },

  create: async (payload: Partial<LessonItem>): Promise<LessonItem> => {
    const response = await api.post<ApiResponse<LessonItem> | LessonItem>('/lektions', payload)
    if ('data' in response.data && response.data.data) {
      return (response.data as ApiResponse<LessonItem>).data
    }
    return response.data as LessonItem
  },

  update: async (id: string, payload: Partial<LessonItem>): Promise<LessonItem> => {
    const response = await api.put<ApiResponse<LessonItem> | LessonItem>(`/lektions/${id}`, payload)
    if ('data' in response.data && response.data.data) {
      return (response.data as ApiResponse<LessonItem>).data
    }
    return response.data as LessonItem
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/lektions/${id}`)
  },
}
