import api from './api'
import { exerciseApi } from './exerciseApi'
import type { ApiResponse } from '../types/api'
import type { LessonItem, LessonDetailData, LessonDetailResponse, LessonPreviewVocabulary } from '../types/lesson'
import type { LessonExercise } from '../types/exercise'
import { normalizeExercise } from '../utils/exerciseAdapter'

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
    const rawLessonRecord = (rawLesson || {}) as unknown as Record<string, unknown>
    const previewRecord = (resData?.preview || {}) as Record<string, unknown>
    const rawPreviewVocabs: LessonPreviewVocabulary[] =
      (Array.isArray(resData?.preview?.vocabularies) && resData.preview.vocabularies) ||
      (Array.isArray(resData?.vocabularies) && resData.vocabularies) ||
      (Array.isArray(rawLessonRecord.vocabularies) ? (rawLessonRecord.vocabularies as unknown as LessonPreviewVocabulary[]) : []) ||
      []

    const rawExercises: LessonExercise[] =
      (Array.isArray(resData?.exercises) && resData.exercises) ||
      (Array.isArray(rawLessonRecord.exercises) && (rawLessonRecord.exercises as LessonExercise[])) ||
      (Array.isArray(previewRecord.exercises) && (previewRecord.exercises as LessonExercise[])) ||
      []

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

    let exercises = rawExercises.map((ex, idx) => {
      const vocabObj = ex.vocabulary_id
      const vocabIdVal = typeof vocabObj === 'object' && vocabObj !== null ? vocabObj._id : (typeof vocabObj === 'string' ? vocabObj : ex.vocabularyId)
      const vocabNameVal = typeof vocabObj === 'object' && vocabObj !== null ? vocabObj.word : (ex.vocabularyName || 'Tổng hợp')

      const baseEx: LessonExercise = {
        ...ex,
        _id: ex._id || `ex_${idx}`,
        order: ex.order || idx + 1,
        vocabularyId: vocabIdVal,
        vocabularyName: vocabNameVal,
        xp: ex.xp || (ex.type === 'sentence_arrangement' ? 15 : ex.type === 'multiple_choice' ? 5 : 10),
        status: ex.status || 'active',
      }
      return normalizeExercise(baseEx)
    })

    if (exercises.length === 0) {
      const extraExercises = await exerciseApi.getByLesson(id).catch(() => [])
      if (extraExercises.length > 0) {
        exercises = extraExercises.map((ex) => normalizeExercise(ex))
      }
    }

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
