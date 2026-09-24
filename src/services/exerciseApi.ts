import api from './api'
import { progressService } from './progressService'
import type { ApiResponse } from '../types/api'
import type { LessonExercise } from '../types/exercise'
import type { ExerciseSubmitResponse } from '../types/student'

import { normalizeExercise } from '../utils/exerciseAdapter'

const extractExerciseArray = (responseData: unknown): LessonExercise[] => {
  if (!responseData) return []
  let items: LessonExercise[] = []

  if (Array.isArray(responseData)) {
    items = responseData as LessonExercise[]
  } else {
    const resObj = responseData as Record<string, unknown>
    const dataObj = resObj.data || resObj

    if (Array.isArray(dataObj)) {
      items = dataObj as LessonExercise[]
    } else if (dataObj && typeof dataObj === 'object') {
      const dataRecord = dataObj as Record<string, unknown>
      if (Array.isArray(dataRecord.exercises)) items = dataRecord.exercises as LessonExercise[]
      else if (Array.isArray(dataRecord.data)) items = dataRecord.data as LessonExercise[]
    } else if (Array.isArray(resObj.exercises)) {
      items = resObj.exercises as LessonExercise[]
    }
  }

  return items.map((ex) => normalizeExercise(ex))
}

const matchesLessonId = (ex: LessonExercise, lessonId: string): boolean => {
  if (!lessonId) return false
  const rootEx = ex as unknown as Record<string, unknown>
  const lid =
    (typeof ex.lesson_id === 'object' && ex.lesson_id !== null ? (ex.lesson_id as { _id?: string })._id : ex.lesson_id) ||
    (typeof rootEx.lessonId === 'object' && rootEx.lessonId !== null ? (rootEx.lessonId as { _id?: string })._id : rootEx.lessonId) ||
    (typeof rootEx.lesson === 'object' && rootEx.lesson !== null ? (rootEx.lesson as { _id?: string })._id : rootEx.lesson) ||
    rootEx.lesson_id ||
    rootEx.lessonId
  return String(lid) === String(lessonId)
}

export const exerciseApi = {
  getAll: async (params?: { lesson_id?: string; lessonId?: string }): Promise<LessonExercise[]> => {
    try {
      const lessonIdVal = params?.lesson_id || params?.lessonId
      const url = lessonIdVal ? `/exercises?lesson_id=${encodeURIComponent(lessonIdVal)}` : '/exercises'
      const response = await api.get<unknown>(url)
      return extractExerciseArray(response.data)
    } catch {
      return []
    }
  },

  getByLesson: async (lessonId: string): Promise<LessonExercise[]> => {
    if (!lessonId) return []

    // 1. Try GET /exercises?lesson_id=...
    try {
      const res1 = await api.get<unknown>(`/exercises?lesson_id=${encodeURIComponent(lessonId)}`)
      const list1 = extractExerciseArray(res1.data)
      if (list1.length > 0) {
        const matched = list1.filter((ex) => matchesLessonId(ex, lessonId))
        return matched.length > 0 ? matched : list1
      }
    } catch {
      // ignore
    }

    // 2. Try GET /exercises?lessonId=...
    try {
      const res2 = await api.get<unknown>(`/exercises?lessonId=${encodeURIComponent(lessonId)}`)
      const list2 = extractExerciseArray(res2.data)
      if (list2.length > 0) {
        const matched = list2.filter((ex) => matchesLessonId(ex, lessonId))
        return matched.length > 0 ? matched : list2
      }
    } catch {
      // ignore
    }

    // 3. Try GET /lessons/:id/exercises
    try {
      const res3 = await api.get<unknown>(`/lessons/${encodeURIComponent(lessonId)}/exercises`)
      const list3 = extractExerciseArray(res3.data)
      if (list3.length > 0) {
        return list3
      }
    } catch {
      // ignore
    }

    // 4. Fallback: fetch all exercises and filter by lessonId on client side
    try {
      const allRes = await api.get<unknown>('/exercises')
      const allList = extractExerciseArray(allRes.data)
      const matched = allList.filter((ex) => matchesLessonId(ex, lessonId))
      if (matched.length > 0) {
        return matched
      }
    } catch {
      // ignore
    }

    return []
  },

  create: async (lessonId: string, payload: Partial<LessonExercise>): Promise<LessonExercise> => {
    const response = await api.post<ApiResponse<{ exercise: LessonExercise } | LessonExercise>>('/exercises', {
      ...payload,
      lesson_id: lessonId,
      lessonId,
    })
    const resData = response.data.data
    if (resData && typeof resData === 'object' && 'exercise' in resData) {
      return resData.exercise
    }
    return resData as LessonExercise
  },

  update: async (exerciseId: string, payload: Partial<LessonExercise>): Promise<LessonExercise> => {
    const response = await api.put<ApiResponse<{ exercise: LessonExercise } | LessonExercise>>(`/exercises/${encodeURIComponent(exerciseId)}`, payload)
    const resData = response.data.data
    if (resData && typeof resData === 'object' && 'exercise' in resData) {
      return resData.exercise
    }
    return resData as LessonExercise
  },

  delete: async (exerciseId: string): Promise<void> => {
    await api.delete(`/exercises/${encodeURIComponent(exerciseId)}`)
  },

  submitAnswer: async (
    lessonId: string,
    exerciseId: string,
    answer: string | number | string[] | Array<{ left: string; right: string }>,
  ): Promise<ExerciseSubmitResponse> => {
    const rawData = await progressService.submitExerciseAnswer(lessonId, exerciseId, answer) as { is_correct?: boolean; correct?: boolean; xp_earned?: number; xp?: number; explanation?: string; feedback?: string } | undefined

    const isCorrect = rawData?.is_correct ?? rawData?.correct ?? false
    const xp = rawData?.xp_earned ?? rawData?.xp ?? 0
    const explanation = rawData?.explanation || rawData?.feedback || ''

    return {
      is_correct: isCorrect,
      xp_earned: xp,
      explanation,
      correct: isCorrect,
      feedback: explanation,
      xp,
    }
  },
}
