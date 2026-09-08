import { unitApi } from './unitApi'
import { lessonApi } from './lessonApi'
import { exerciseApi } from './exerciseApi'
import { progressService } from './progressService'
import type {
  ExerciseSubmitPayload,
  ExerciseSubmitResponse,
  UnitLearningData,
} from '../types/student'
import type { LessonDetailData } from '../types/lesson'

export const studentLearningService = {
  getUnitLessons: async (unitId: string): Promise<UnitLearningData> => {
    const [unitRes, rawLessons] = await Promise.all([
      unitApi.getById(unitId).catch(() => null),
      lessonApi.getAll({ unit_id: unitId }),
    ])

    const unitName = unitRes?.unit_name || unitRes?.name || 'Unit'
    const topicName = typeof unitRes?.topic === 'object' && unitRes.topic !== null ? (unitRes.topic.topic_name || unitRes.topic.name) : 'Topic'
    const levelName = typeof unitRes?.level_id === 'object' && unitRes.level_id !== null ? (unitRes.level_id.level_name || unitRes.level_id.name) : 'A1'

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
      description: unitRes?.description || '',
      lessons,
    }
  },

  getLessonLearningData: async (lessonId: string): Promise<LessonDetailData> => {
    const data = await lessonApi.getById(lessonId)
    if (!data.exercises || data.exercises.length === 0) {
      const extraExercises = await exerciseApi.getByLesson(lessonId).catch(() => [])
      if (extraExercises.length > 0) {
        data.exercises = extraExercises
      }
    }
    return data
  },

  submitExerciseAnswer: async (payload: ExerciseSubmitPayload): Promise<ExerciseSubmitResponse> => {
    return await exerciseApi.submitAnswer(payload.lessonId, payload.exerciseId, payload.answer)
  },

  completeLesson: async (lessonId: string): Promise<{ success: boolean; xpEarned: number }> => {
    const response = await progressService.completeLesson(lessonId)
    const resData = response.data as { lessonProgress?: { xp_earned?: number }; xpEarned?: number } | undefined
    return {
      success: response.success ?? true,
      xpEarned: resData?.lessonProgress?.xp_earned || resData?.xpEarned || 20,
    }
  },
}
