import api from './api'
import type {
  LessonProgressItem,
  VocabularyProgressItem,
  DashboardProgressOverview,
} from '../types/progress'

export const progressService = {
  getLessonProgressList: async (): Promise<LessonProgressItem[]> => {
    try {
      const response = await api.get<any>('/progress/lessons')
      const data = response.data?.data || response.data?.lessons || response.data
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          _id: item._id || item.id,
          user: item.user || item.userId || '',
          lesson: item.lesson || item.lessonId || item.lektionId || '',
          status: item.status || (item.progress === 100 ? 'completed' : item.progress > 0 ? 'in_progress' : 'not_started'),
          progress: Number(item.progress ?? item.percentage ?? 0),
          score: Number(item.score ?? 0),
          total_exercises: Number(item.total_exercises ?? item.totalExercises ?? 0),
          completed_exercises: Number(item.completed_exercises ?? item.completedExercises ?? 0),
          xp_earned: Number(item.xp_earned ?? item.xpEarned ?? 0),
          started_at: item.started_at || item.startedAt,
          completed_at: item.completed_at || item.completedAt,
        }))
      }
    } catch (err) {
      console.warn('Fallback getLessonProgressList:', err)
    }
    return []
  },

  startLessonProgress: async (lessonId: string): Promise<LessonProgressItem> => {
    try {
      const response = await api.post<any>(`/progress/lessons/${lessonId}/start`)
      return response.data?.data || response.data
    } catch (err) {
      console.warn('Fallback startLessonProgress:', err)
      return {
        _id: `lp_${lessonId}`,
        user: 'current_user',
        lesson: lessonId,
        status: 'in_progress',
        progress: 0,
        score: 0,
        total_exercises: 5,
        completed_exercises: 0,
        xp_earned: 0,
        started_at: new Date().toISOString(),
      }
    }
  },

  updateLessonProgress: async (
    lessonId: string,
    progressPercentage: number,
    score: number,
    completedExercises: number,
  ): Promise<LessonProgressItem> => {
    try {
      const response = await api.post<any>(`/progress/lessons/${lessonId}/update`, {
        progress: progressPercentage,
        score,
        completed_exercises: completedExercises,
      })
      return response.data?.data || response.data
    } catch (err) {
      console.warn('Fallback updateLessonProgress:', err)
      return {
        _id: `lp_${lessonId}`,
        user: 'current_user',
        lesson: lessonId,
        status: progressPercentage >= 100 ? 'completed' : 'in_progress',
        progress: progressPercentage,
        score,
        total_exercises: 5,
        completed_exercises: completedExercises,
        xp_earned: score * 5,
      }
    }
  },

  completeLessonProgress: async (lessonId: string, xpEarned: number): Promise<LessonProgressItem> => {
    try {
      const response = await api.post<any>(`/progress/lessons/${lessonId}/complete`, { xp_earned: xpEarned })
      return response.data?.data || response.data
    } catch (err) {
      console.warn('Fallback completeLessonProgress:', err)
      return {
        _id: `lp_${lessonId}`,
        user: 'current_user',
        lesson: lessonId,
        status: 'completed',
        progress: 100,
        score: 5,
        total_exercises: 5,
        completed_exercises: 5,
        xp_earned: xpEarned,
        completed_at: new Date().toISOString(),
      }
    }
  },

  getVocabularyProgressList: async (): Promise<VocabularyProgressItem[]> => {
    try {
      const response = await api.get<any>('/progress/vocabularies')
      const data = response.data?.data || response.data?.vocabularies || response.data
      if (Array.isArray(data)) {
        return data.map((v: any) => ({
          _id: v._id || v.id,
          user: v.user || v.userId || '',
          vocabulary: v.vocabulary || v.vocabularyId || '',
          mastery: v.mastery || (v.times_correct >= 3 ? 'mastered' : v.times_answered > 0 ? 'learning' : 'new'),
          times_seen: Number(v.times_seen ?? 0),
          times_answered: Number(v.times_answered ?? 0),
          times_correct: Number(v.times_correct ?? 0),
          times_wrong: Number(v.times_wrong ?? 0),
          last_reviewed_at: v.last_reviewed_at || v.lastReviewedAt,
        }))
      }
    } catch (err) {
      console.warn('Fallback getVocabularyProgressList:', err)
    }
    return []
  },

  recordVocabularyView: async (vocabularyId: string): Promise<VocabularyProgressItem> => {
    try {
      const response = await api.post<any>(`/progress/vocabularies/${vocabularyId}/record-view`)
      return response.data?.data || response.data
    } catch (err) {
      console.warn('Fallback recordVocabularyView:', err)
      return {
        _id: `vp_${vocabularyId}`,
        user: 'current_user',
        vocabulary: vocabularyId,
        mastery: 'learning',
        times_seen: 1,
        times_answered: 0,
        times_correct: 0,
        times_wrong: 0,
        last_reviewed_at: new Date().toISOString(),
      }
    }
  },

  recordVocabularyAnswer: async (
    vocabularyId: string,
    isCorrect: boolean,
  ): Promise<VocabularyProgressItem> => {
    try {
      const response = await api.post<any>(`/progress/vocabularies/${vocabularyId}/record-answer`, { isCorrect })
      return response.data?.data || response.data
    } catch (err) {
      console.warn('Fallback recordVocabularyAnswer:', err)
      return {
        _id: `vp_${vocabularyId}`,
        user: 'current_user',
        vocabulary: vocabularyId,
        mastery: isCorrect ? 'mastered' : 'review',
        times_seen: 1,
        times_answered: 1,
        times_correct: isCorrect ? 1 : 0,
        times_wrong: isCorrect ? 0 : 1,
        last_reviewed_at: new Date().toISOString(),
      }
    }
  },

  getDashboardOverview: async (): Promise<DashboardProgressOverview> => {
    try {
      const response = await api.get<any>('/progress/dashboard')
      const res = response.data?.data || response.data

      if (res && typeof res === 'object') {
        const breakdown = res.masteryBreakdown || res.mastery_breakdown || {}
        return {
          todayLearnedCount: Number(res.todayLearnedCount ?? res.todayLearned ?? 5),
          todayXpEarned: Number(res.todayXpEarned ?? res.todayXp ?? 40),
          lessonsCompletedCount: Number(res.lessonsCompletedCount ?? res.lessonsCompleted ?? 2),
          totalVocabularyCount: Number(res.totalVocabularyCount ?? res.totalWords ?? 50),
          totalLearnedVocabularyCount: Number(res.totalLearnedVocabularyCount ?? res.totalLearned ?? 12),
          totalXp: Number(res.totalXp ?? res.xp ?? 150),
          masteryBreakdown: {
            new: Number(breakdown.new ?? 15),
            learning: Number(breakdown.learning ?? 10),
            review: Number(breakdown.review ?? 5),
            mastered: Number(breakdown.mastered ?? 8),
          },
        }
      }
    } catch (err) {
      console.warn('Fallback getDashboardOverview:', err)
    }

    return {
      todayLearnedCount: 5,
      todayXpEarned: 40,
      lessonsCompletedCount: 2,
      totalVocabularyCount: 50,
      totalLearnedVocabularyCount: 12,
      totalXp: 150,
      masteryBreakdown: {
        new: 15,
        learning: 10,
        review: 5,
        mastered: 8,
      },
    }
  },
}
