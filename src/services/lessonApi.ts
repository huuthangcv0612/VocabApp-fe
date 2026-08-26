import api from './api'
import type { ApiResponse } from '../types/api'
import type { LessonItem, LessonDetailData, LessonDetailResponse } from '../types/lesson'

export const lessonApi = {
  getAll: async (params?: { level_id?: string; levelId?: string; unit_id?: string; unitId?: string; status?: string }): Promise<LessonItem[]> => {
    const queryParams = new URLSearchParams()
    const levelIdVal = params?.level_id || params?.levelId
    const unitIdVal = params?.unit_id || params?.unitId
    if (levelIdVal) queryParams.append('level_id', levelIdVal)
    if (unitIdVal) queryParams.append('unit_id', unitIdVal)
    if (params?.status) queryParams.append('status', params.status)

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''
    const response = await api.get<ApiResponse<{ lessons: LessonItem[]; count?: number } | LessonItem[]>>(`/lessons${queryString}`)
    const data = response.data.data

    if (Array.isArray(data)) return data
    if (data && typeof data === 'object' && 'lessons' in data && Array.isArray(data.lessons)) {
      return data.lessons
    }
    return []
  },

  getByLevel: async (levelId: string): Promise<LessonItem[]> => {
    return lessonApi.getAll({ level_id: levelId })
  },

  getById: async (id: string): Promise<LessonDetailData> => {
    const response = await api.get<ApiResponse<LessonDetailResponse>>(`/lessons/${encodeURIComponent(id)}`)
    const resData = response.data.data

    const rawLesson = resData?.lesson || (resData as unknown as LessonItem)
    const rawPreviewVocabs = resData?.preview?.vocabularies || resData?.vocabularies || []
    const rawExercises = resData?.exercises || []

    const vocabularies = rawPreviewVocabs.map((v, idx) => {
      const vRec = v as unknown as Record<string, string | number | boolean>
      return {
        _id: v._id || `pv_${idx}`,
        vocabularyId: v.vocabularyId || v._id,
        word: v.word,
        meaning: v.meaning,
        gender: v.gender,
        phonetic: v.phonetic || (vRec.pronunciation as string) || undefined,
        order: v.order || idx + 1,
        is_new: v.is_new ?? true,
        level: v.level,
        type: v.type || (vRec.part_of_speech as string) || undefined,
      }
    })

    const exercises = rawExercises.map((ex, idx) => {
      const contentObj = ex.content || {}
      const exType = ex.type || 'multiple_choice'
      const vocabObj = ex.vocabulary_id

      const displayQuestion = ex.question || contentObj.question || contentObj.prompt || contentObj.sentence || 'Exercise Question'

      const vocabIdVal = typeof vocabObj === 'object' && vocabObj !== null ? vocabObj._id : (typeof vocabObj === 'string' ? vocabObj : ex.vocabularyId)
      const vocabNameVal = typeof vocabObj === 'object' && vocabObj !== null ? vocabObj.word : (ex.vocabularyName || 'Tổng hợp')

      return {
        _id: ex._id || `ex_${idx}`,
        order: ex.order || idx + 1,
        type: exType,
        vocabularyId: vocabIdVal,
        vocabularyName: vocabNameVal,
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
    return lessonApi.getById(id)
  },

  create: async (payload: Partial<LessonItem>): Promise<LessonItem> => {
    const response = await api.post<ApiResponse<{ lesson: LessonItem } | LessonItem>>('/lessons', payload)
    const resData = response.data.data
    if (resData && typeof resData === 'object' && 'lesson' in resData) {
      return resData.lesson
    }
    return resData as LessonItem
  },

  update: async (id: string, payload: Partial<LessonItem>): Promise<LessonItem> => {
    const response = await api.put<ApiResponse<{ lesson: LessonItem } | LessonItem>>(`/lessons/${encodeURIComponent(id)}`, payload)
    const resData = response.data.data
    if (resData && typeof resData === 'object' && 'lesson' in resData) {
      return resData.lesson
    }
    return resData as LessonItem
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/lessons/${encodeURIComponent(id)}`)
  },
}
