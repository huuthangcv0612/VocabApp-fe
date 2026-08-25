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

  markWordLearned: async (
    lektionId: string,
    vocabularyId: string,
    isCorrect?: boolean,
  ): Promise<{ success: boolean; data?: unknown }> => {
    const response = await api.post<ApiResponse<unknown>>(
      `/progress/lektion/${encodeURIComponent(lektionId)}/learn-word`,
      {
        vocabulary_id: vocabularyId,
        isCorrect,
      },
    )
    return { success: response.data.success, data: response.data.data }
  },

  completeLektion: async (
    lektionId: string,
  ): Promise<{ success: boolean; data?: unknown }> => {
    const response = await api.post<ApiResponse<unknown>>(
      `/progress/lektion/${encodeURIComponent(lektionId)}/complete`,
    )
    return { success: response.data.success, data: response.data.data }
  },

  getDashboardOverview: async (): Promise<DashboardProgressOverview> => {
    const progressData = await progressService.getUserProgressOverview()
    const stats = progressData?.stats || { completedLektionsCount: 0, totalLearnedWordsCount: 0 }
    const progresses = progressData?.lektionProgresses || []

    return {
      todayLearnedCount: stats.totalLearnedWordsCount,
      todayXpEarned: stats.completedLektionsCount * 20,
      lessonsCompletedCount: stats.completedLektionsCount,
      totalVocabularyCount: stats.totalLearnedWordsCount,
      totalLearnedVocabularyCount: stats.totalLearnedWordsCount,
      totalXp: stats.completedLektionsCount * 20,
      masteryBreakdown: {
        new: 0,
        learning: progresses.filter((p) => p.status === 'in_progress').length,
        review: 0,
        mastered: progresses.filter((p) => p.status === 'completed').length,
      },
    }
  },
}
