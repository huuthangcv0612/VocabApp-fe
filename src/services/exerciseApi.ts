import api from './api'
import type { ApiResponse } from '../types/api'
import type { LessonExercise } from '../types/exercise'
import type { ExerciseSubmitResponse } from '../types/student'

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

  return items.map((ex) => {
    const content = ex.content || {}
    const vocabObj = typeof ex.vocabulary_id === 'object' && ex.vocabulary_id !== null ? ex.vocabulary_id : null
    const displayQuestion =
      ex.question ||
      content.question ||
      content.prompt ||
      content.sentence ||
      (vocabObj ? `Câu hỏi từ vựng: "${vocabObj.word}" (${vocabObj.meaning || ''})` : '') ||
      'Bài tập'

    return {
      ...ex,
      question: displayQuestion,
    }
  })
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
    return exerciseApi.getAll({ lesson_id: lessonId })
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

  submitAnswer: async (lessonId: string, exerciseId: string, answer: string | number | string[]): Promise<ExerciseSubmitResponse> => {
    const response = await api.post<ApiResponse<{ is_correct: boolean; xp_earned: number; explanation?: string; feedback?: string }>>(
      `/progress/lessons/${encodeURIComponent(lessonId)}/submit-exercise`,
      { exercise_id: exerciseId, answer },
    )

    const resData = response.data.data
    const isCorrect = resData?.is_correct ?? false
    const xp = resData?.xp_earned ?? 0
    const explanation = resData?.explanation || resData?.feedback || ''

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
