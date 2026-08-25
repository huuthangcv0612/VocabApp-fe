import api from './api'
import type { ApiResponse } from '../types/api'
import type { LessonItem, LessonDetailData, LessonDetailResponse } from '../types/lesson'

export const lessonApi = {
  getAll: async (params?: { unitId?: string; topicId?: string; q?: string }): Promise<LessonItem[]> => {
    const url = params?.unitId ? `/lessons/unit/${encodeURIComponent(params.unitId)}` : '/lessons'
    const response = await api.get<ApiResponse<LessonItem[] | { lessons: LessonItem[] }>>(url)
    const data = response.data.data
    if (Array.isArray(data)) return data
    if (data && 'lessons' in data && Array.isArray(data.lessons)) return data.lessons
    return []
  },

  getById: async (id: string): Promise<LessonDetailData> => {
    const response = await api.get<ApiResponse<LessonDetailResponse>>(`/lessons/${encodeURIComponent(id)}`)
    const resData = response.data.data

    const rawLesson = resData?.lesson || (resData as unknown as LessonItem)
    const rawPreviewVocabs = resData?.preview?.vocabularies || resData?.vocabularies || []
    const rawExercises = resData?.exercises || []

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
      const exType = ex.type || 'multiple_choice'

      const displayQuestion = ex.question || contentObj.question || contentObj.prompt || contentObj.sentence || 'Exercise Question'

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
        options: ex.options || (contentObj.options ? contentObj.options.map((optText: string) => ({
          text: optText,
        })) : []),
        explanation: ex.explanation || '',
      }
    })

    return { lesson: rawLesson, vocabularies, exercises }
  },

  getAdminDetail: async (id: string): Promise<LessonDetailData> => {
    const response = await api.get<ApiResponse<LessonDetailResponse>>(`/admin/lessons/${encodeURIComponent(id)}/detail`)
    const resData = response.data.data

    const rawLesson = resData?.lesson || (resData as unknown as LessonItem)
    const rawPreviewVocabs = resData?.preview?.vocabularies || resData?.vocabularies || []
    const rawExercises = resData?.exercises || []

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

    return { lesson: rawLesson, vocabularies, exercises: rawExercises }
  },

  create: async (payload: Partial<LessonItem>): Promise<LessonItem> => {
    const response = await api.post<ApiResponse<LessonItem>>('/admin/lessons', payload)
    return response.data.data
  },

  update: async (id: string, payload: Partial<LessonItem>): Promise<LessonItem> => {
    const response = await api.put<ApiResponse<LessonItem>>(`/admin/lessons/${encodeURIComponent(id)}`, payload)
    return response.data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/lessons/${encodeURIComponent(id)}`)
  },
}
