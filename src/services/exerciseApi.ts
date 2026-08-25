import api from './api'
import type { ApiResponse } from '../types/api'
import type { LessonExercise } from '../types/exercise'
import type { ExerciseSubmitResponse } from '../types/student'

export const exerciseApi = {
  create: async (lessonId: string, payload: Partial<LessonExercise>): Promise<LessonExercise> => {
    const response = await api.post<ApiResponse<LessonExercise>>('/admin/exercises', {
      ...payload,
      lessonId,
    })
    return response.data.data
  },

  update: async (exerciseId: string, payload: Partial<LessonExercise>): Promise<LessonExercise> => {
    const response = await api.put<ApiResponse<LessonExercise>>(`/admin/exercises/${encodeURIComponent(exerciseId)}`, payload)
    return response.data.data
  },

  delete: async (exerciseId: string): Promise<void> => {
    await api.delete(`/admin/exercises/${encodeURIComponent(exerciseId)}`)
  },

  submitAnswer: async (lessonId: string, exerciseId: string, answer: string | number | string[]): Promise<ExerciseSubmitResponse> => {
    const response = await api.post<ApiResponse<{ exercise_id?: string; is_correct: boolean; xp_earned: number; explanation: string }>>(
      `/lessons/${encodeURIComponent(lessonId)}/exercises/${encodeURIComponent(exerciseId)}/submit`,
      { answer },
    )

    const resData = response.data.data
    return {
      is_correct: resData.is_correct,
      xp_earned: resData.xp_earned,
      explanation: resData.explanation,
      correct: resData.is_correct,
      feedback: resData.explanation,
      xp: resData.xp_earned,
    }
  },
}
