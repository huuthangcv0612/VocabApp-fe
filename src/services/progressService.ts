import api from './api'
import type { ApiResponse } from '../types/api'
import type {
  UserProgressData,
  DashboardProgressOverview,
} from '../types/progress'

export const progressService = {
  getUserProgressOverview: async (): Promise<UserProgressData> => {
    const response = await api.get<ApiResponse<UserProgressData>>('/progress')
    return response.data.data
  },

  getLessonProgress: async (lessonId: string) => {
    const response = await api.get<ApiResponse<unknown>>(`/progress/lessons/${encodeURIComponent(lessonId)}`)
    return response.data.data
  },

  startLesson: async (lessonId: string) => {
    const response = await api.post<ApiResponse<unknown>>(`/progress/lessons/${encodeURIComponent(lessonId)}/start`)
    return response.data.data
  },

  submitExerciseAnswer: async (lessonId: string, exerciseId: string, answer: unknown) => {
    const response = await api.post<ApiResponse<unknown>>(`/progress/lessons/${encodeURIComponent(lessonId)}/submit-exercise`, {
      exercise_id: exerciseId,
      answer,
    })
    return response.data.data
  },

  completeLesson: async (lessonId: string) => {
    const response = await api.post<ApiResponse<{ lessonProgress?: unknown; nextLesson?: unknown }>>(`/progress/lessons/${encodeURIComponent(lessonId)}/complete`)
    return response.data
  },

  markWordLearned: async (
    lessonId: string,
    _vocabularyId?: string,
    _isCorrect?: boolean,
  ): Promise<{ success: boolean; data?: unknown }> => {
    return await progressService.startLesson(lessonId).then(data => ({ success: true, data })).catch(() => ({ success: false }))
  },

  completeLektion: async (
    lessonId: string,
  ): Promise<{ success: boolean; data?: unknown }> => {
    const res = await progressService.completeLesson(lessonId)
    return { success: res.success, data: res.data }
  },

  getDashboardOverview: async (): Promise<DashboardProgressOverview> => {
    const progressData = await progressService.getUserProgressOverview()
    const stats = progressData?.stats || { totalLearnedWordsCount: 0 }
    const completedCount = stats.completedLessonsCount ?? stats.completedLektionsCount ?? 0
    const progresses = progressData?.lessonProgresses || progressData?.lektionProgresses || []

    return {
      todayLearnedCount: stats.totalLearnedWordsCount,
      todayXpEarned: completedCount * 20,
      lessonsCompletedCount: completedCount,
      totalVocabularyCount: stats.totalLearnedWordsCount,
      totalLearnedVocabularyCount: stats.totalLearnedWordsCount,
      totalXp: completedCount * 20,
      masteryBreakdown: {
        new: 0,
        learning: progresses.filter((p) => p.status === 'in_progress').length,
        review: 0,
        mastered: progresses.filter((p) => p.status === 'completed').length,
      },
    }
  },
}
