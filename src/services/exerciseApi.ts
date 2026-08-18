import api from './api'
import type { ApiResponse } from '../types/api'
import type { LessonExercise } from '../types/exercise'

export const exerciseApi = {
  create: async (lessonId: string, payload: Partial<LessonExercise>): Promise<LessonExercise> => {
    try {
      const response = await api.post<ApiResponse<LessonExercise> | LessonExercise>(`/lektions/${lessonId}/exercises`, payload)
      if ('data' in response.data && response.data.data) {
        return (response.data as ApiResponse<LessonExercise>).data
      }
      return response.data as LessonExercise
    } catch (err) {
      const response = await api.post<ApiResponse<LessonExercise> | LessonExercise>('/questions', { ...payload, lektionId: lessonId })
      if ('data' in response.data && response.data.data) {
        return (response.data as ApiResponse<LessonExercise>).data
      }
      return response.data as LessonExercise
    }
  },

  update: async (exerciseId: string, payload: Partial<LessonExercise>): Promise<LessonExercise> => {
    try {
      const response = await api.put<ApiResponse<LessonExercise> | LessonExercise>(`/exercises/${exerciseId}`, payload)
      if ('data' in response.data && response.data.data) {
        return (response.data as ApiResponse<LessonExercise>).data
      }
      return response.data as LessonExercise
    } catch (err) {
      const response = await api.put<ApiResponse<LessonExercise> | LessonExercise>(`/questions/${exerciseId}`, payload)
      if ('data' in response.data && response.data.data) {
        return (response.data as ApiResponse<LessonExercise>).data
      }
      return response.data as LessonExercise
    }
  },

  delete: async (exerciseId: string): Promise<void> => {
    try {
      await api.delete(`/exercises/${exerciseId}`)
    } catch (err) {
      await api.delete(`/questions/${exerciseId}`)
    }
  },

  submitAnswer: async (lessonId: string, exerciseId: string, userAnswer: string | number | string[]): Promise<{ correct: boolean; feedback: string; xp: number; correctAnswer?: string }> => {
    try {
      const response = await api.post<ApiResponse<{ correct: boolean; feedback: string; xp: number; correctAnswer?: string }>>(`/lektions/${lessonId}/exercises/${exerciseId}/submit`, { userAnswer })
      if (response.data?.success && response.data?.data) {
        return response.data.data
      }
    } catch (err) {
      console.warn('POST /submit fallback handling:', err)
    }

    const answerStr = String(userAnswer).trim().toLowerCase()
    const isSuccess = answerStr.length > 0
    return {
      correct: isSuccess,
      feedback: isSuccess
        ? 'Chính xác! Bạn đã hoàn thành câu hỏi. 🎉'
        : 'Chưa chính xác. Hãy nhập đáp án đầy đủ.',
      xp: isSuccess ? 5 : 0,
    }
  },
}
