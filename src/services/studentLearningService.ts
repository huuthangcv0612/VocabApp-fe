import api from './api'
import { lessonApi } from './lessonApi'
import { exerciseApi } from './exerciseApi'
import type { ApiResponse } from '../types/api'
import type {
  ExerciseSubmitPayload,
  ExerciseSubmitResponse,
  UnitLearningData,
} from '../types/student'
import type { LessonDetailData } from '../types/lesson'
import type { UnitItem } from '../types/unit'
import type { LessonItem } from '../types/lesson'

export const studentLearningService = {
  getUnitLessons: async (unitId: string): Promise<UnitLearningData> => {
    const response = await api.get<ApiResponse<UnitItem & { lessons?: LessonItem[] }>>(`/units/${encodeURIComponent(unitId)}`)
    const res = response.data.data

    const unitName = res.unit_name || res.name || 'Unit'
    const topicName = typeof res.topic === 'object' && res.topic !== null ? (res.topic.topic_name || res.topic.name) : 'Topic'
    const levelName = typeof res.level_id === 'object' && res.level_id !== null ? (res.level_id.level_name || res.level_id.name) : 'A1'
    const rawLessons = res.lessons || []

    const lessons = rawLessons.map((l, idx) => ({
      _id: l._id || `l_${idx}`,
      title: l.title || l.lektion_name || `Lesson ${idx + 1}`,
      description: l.description || '',
      status: ((l.status as unknown) === 'completed' ? 'completed' : 'available') as 'completed' | 'available' | 'locked',
      estimated_minutes: l.estimated_minutes || 15,
      xp: l.xp || 20,
    }))

    return {
      unitId,
      unitName,
      topicName,
      levelName,
      description: res.description || '',
      lessons,
    }
  },

  getLessonLearningData: async (lessonId: string): Promise<LessonDetailData> => {
    return await lessonApi.getById(lessonId)
  },

  submitExerciseAnswer: async (payload: ExerciseSubmitPayload): Promise<ExerciseSubmitResponse> => {
    return await exerciseApi.submitAnswer(payload.lessonId, payload.exerciseId, payload.answer)
  },

  completeLesson: async (lessonId: string): Promise<{ success: boolean; xpEarned: number }> => {
    const response = await api.post<ApiResponse<{ lessonProgress?: { xp_earned?: number }; xpEarned?: number }>>(`/progress/lessons/${encodeURIComponent(lessonId)}/complete`)
    return {
      success: response.data.success,
      xpEarned: response.data.data?.lessonProgress?.xp_earned || response.data.data?.xpEarned || 20,
    }
  },
}
