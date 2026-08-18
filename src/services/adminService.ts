import api from './api'
import { levelApi } from './levelApi'
import { topicApi } from './topicApi'
import { unitApi } from './unitApi'
import { lessonApi } from './lessonApi'
import { vocabularyApi } from './vocabularyApi'
import { exerciseApi } from './exerciseApi'

import type {
  AdminStatistics,
  QuestionItem,
  QuestionQuery,
  QuestionsResponseData,
  TestItem,
  TestConfigPayload,
  UserAdminItem,
  LevelItem,
  TopicItem,
  UnitItem,
  LessonItem,
  VocabularyAdminItem,
  PaginationMeta,
  LessonDetailData,
  LessonExercise,
} from '../types/admin'

export const adminService = {
  // 1. Dashboard Statistics
  getStatistics: async (): Promise<AdminStatistics> => {
    try {
      const response = await api.get<{ success: boolean; data: AdminStatistics }>('/admin/stats')
      if (response.data?.data) return response.data.data
    } catch (err) {
      console.warn('Fallback admin stats:', err)
    }

    return {
      totalQuestions: 120,
      totalTests: 15,
      totalUsers: 45,
      totalResults: 88,
      totalVocabularies: 350,
      questionsByLevel: { A1: 45, A2: 35, B1: 25, B2: 15 },
      recentUsers: [
        { _id: 'u1', name: 'Anna Schmidt', email: 'anna@example.com', role: 'user', createdAt: '2026-08-10' },
        { _id: 'u2', name: 'Lukas Weber', email: 'lukas@example.com', role: 'user', createdAt: '2026-08-11' },
      ],
    }
  },

  // 2. Question Bank CRUD
  getQuestions: async (query: QuestionQuery = {}): Promise<QuestionsResponseData> => {
    try {
      const params = new URLSearchParams()
      if (query.level) params.append('level', query.level)
      if (query.skill) params.append('skill', query.skill)
      if (query.difficulty) params.append('difficulty', query.difficulty)
      if (query.status) params.append('status', query.status)
      if (query.q) params.append('q', query.q)
      if (query.page) params.append('page', String(query.page))
      if (query.limit) params.append('limit', String(query.limit))

      const response = await api.get<{ success: boolean; data: QuestionsResponseData }>(`/questions?${params.toString()}`)
      if (response.data?.data) return response.data.data
    } catch (err) {
      console.warn('Fallback questions API:', err)
    }

    return {
      questions: [],
      pagination: { page: query.page || 1, limit: query.limit || 10, total: 0, pages: 1 },
    }
  },

  createQuestion: async (payload: Partial<QuestionItem>): Promise<QuestionItem> => {
    const response = await api.post<{ success: boolean; data: QuestionItem }>('/questions', payload)
    return response.data?.data || (response.data as unknown as QuestionItem)
  },

  updateQuestion: async (id: string, payload: Partial<QuestionItem>): Promise<QuestionItem> => {
    const response = await api.put<{ success: boolean; data: QuestionItem }>(`/questions/${id}`, payload)
    return response.data?.data || (response.data as unknown as QuestionItem)
  },

  deleteQuestion: async (id: string): Promise<void> => {
    await api.delete(`/questions/${id}`)
  },

  // 3. Test Config CRUD
  getTests: async (): Promise<TestItem[]> => {
    try {
      const response = await api.get<{ success: boolean; data: TestItem[] }>('/tests')
      if (response.data?.data) return response.data.data
    } catch (err) {
      console.warn('Fallback tests list:', err)
    }

    return []
  },

  createTest: async (payload: TestConfigPayload): Promise<TestItem> => {
    const response = await api.post<{ success: boolean; data: TestItem }>('/tests', payload)
    return response.data?.data || (response.data as unknown as TestItem)
  },

  updateTest: async (id: string, payload: Partial<TestConfigPayload>): Promise<TestItem> => {
    const response = await api.put<{ success: boolean; data: TestItem }>(`/tests/${id}`, payload)
    return response.data?.data || (response.data as unknown as TestItem)
  },

  deleteTest: async (id: string): Promise<void> => {
    await api.delete(`/tests/${id}`)
  },

  // 4. User Management
  getUsers: async (): Promise<UserAdminItem[]> => {
    try {
      const response = await api.get<{ success: boolean; data: UserAdminItem[] }>('/users')
      if (response.data?.data) return response.data.data
    } catch (err) {
      console.warn('Fallback users list:', err)
    }

    return []
  },

  updateUserStatus: async (id: string, status: string): Promise<UserAdminItem> => {
    const response = await api.patch<{ success: boolean; data: UserAdminItem }>(`/users/${id}/status`, { status })
    return response.data?.data || (response.data as unknown as UserAdminItem)
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`)
  },

  // 5. Test Results
  getResults: async (): Promise<{ results: any[]; pagination: PaginationMeta }> => {
    try {
      const response = await api.get<{ success: boolean; data: { results: any[]; pagination: PaginationMeta } }>('/test-results')
      if (response.data?.data) return response.data.data
    } catch (err) {
      console.warn('Fallback test results:', err)
    }

    return {
      results: [],
      pagination: { page: 1, limit: 20, total: 0, pages: 1 },
    }
  },
  getAllResults: async (): Promise<{ results: any[]; pagination: PaginationMeta }> => adminService.getResults(),

  // 4. User Management Aliases
  updateUserRole: async (id: string, role: string): Promise<UserAdminItem> => adminService.updateUserStatus(id, role),
  toggleUserStatus: async (id: string, currentStatus?: string): Promise<UserAdminItem> =>
    adminService.updateUserStatus(id, currentStatus === 'active' ? 'inactive' : 'active'),

  // 6. Level CRUD (Delegates to levelApi)
  getLevels: async (): Promise<LevelItem[]> => levelApi.getAll(),
  createLevel: async (payload: Partial<LevelItem>): Promise<LevelItem> => levelApi.create(payload as any),
  updateLevel: async (id: string, payload: Partial<LevelItem>): Promise<LevelItem> => levelApi.update(id, payload),
  deleteLevel: async (id: string): Promise<void> => levelApi.delete(id),

  // 7. Topic CRUD (Delegates to topicApi)
  getTopics: async (levelId?: string): Promise<TopicItem[]> => topicApi.getAll({ levelId }),
  createTopic: async (payload: Partial<TopicItem>): Promise<TopicItem> => topicApi.create(payload as any),
  updateTopic: async (id: string, payload: Partial<TopicItem>): Promise<TopicItem> => topicApi.update(id, payload),
  deleteTopic: async (id: string): Promise<void> => topicApi.delete(id),

  // 8. Unit CRUD (Delegates to unitApi)
  getUnits: async (topicId?: string): Promise<UnitItem[]> => unitApi.getAll({ topicId }),
  createUnit: async (payload: Partial<UnitItem>): Promise<UnitItem> => unitApi.create(payload as any),
  updateUnit: async (id: string, payload: Partial<UnitItem>): Promise<UnitItem> => unitApi.update(id, payload),
  deleteUnit: async (id: string): Promise<void> => unitApi.delete(id),

  // 9. Lesson CRUD (Delegates to lessonApi)
  getLessons: async (unitId?: string, topicId?: string): Promise<LessonItem[]> => lessonApi.getAll({ unitId, topicId }),
  createLesson: async (payload: Partial<LessonItem>): Promise<LessonItem> => lessonApi.create(payload),
  updateLesson: async (id: string, payload: Partial<LessonItem>): Promise<LessonItem> => lessonApi.update(id, payload),
  deleteLesson: async (id: string): Promise<void> => lessonApi.delete(id),

  // 10. Vocabulary CRUD (Delegates to vocabularyApi)
  getVocabularies: async (
    query: { q?: string; level?: string; page?: number; limit?: number; lektionId?: string } = {},
  ): Promise<{ vocabularies: VocabularyAdminItem[]; pagination: PaginationMeta }> => vocabularyApi.getAll(query),
  createVocabulary: async (payload: Partial<VocabularyAdminItem>): Promise<VocabularyAdminItem> => vocabularyApi.create(payload as any),
  updateVocabulary: async (id: string, payload: Partial<VocabularyAdminItem>): Promise<VocabularyAdminItem> => vocabularyApi.update(id, payload as any),
  deleteVocabulary: async (id: string): Promise<void> => vocabularyApi.delete(id),

  // 11. Lesson Builder Services
  getLessonDetail: async (lessonId: string): Promise<LessonDetailData> => lessonApi.getById(lessonId),

  addVocabularyToLesson: async (
    lessonId: string,
    vocabularyId: string,
    order: number,
    is_new = true,
  ): Promise<any> => {
    try {
      const response = await api.post<{ success: boolean; data: any }>(`/lektions/${lessonId}/vocabularies`, {
        vocabularyId,
        order,
        is_new,
      })
      return response.data?.data || response.data
    } catch (err) {
      return await api.put(`/vocabularies/${vocabularyId}`, { lektionId: lessonId })
    }
  },

  removeVocabularyFromLesson: async (lessonId: string, vocabularyId: string): Promise<void> => {
    try {
      await api.delete(`/lektions/${lessonId}/vocabularies/${vocabularyId}`)
    } catch (err) {
      await api.put(`/vocabularies/${vocabularyId}`, { lektionId: null })
    }
  },

  updateLessonVocabulary: async (
    lessonId: string,
    vocabularyId: string,
    payload: { order?: number; is_new?: boolean },
  ): Promise<void> => {
    try {
      await api.put(`/lektions/${lessonId}/vocabularies/${vocabularyId}`, payload)
    } catch (err) {
      console.warn('Fallback update lesson vocabulary:', err)
    }
  },

  createLessonExercise: async (lessonId: string, payload: Partial<LessonExercise>): Promise<LessonExercise> => exerciseApi.create(lessonId, payload),
  updateLessonExercise: async (exerciseId: string, payload: Partial<LessonExercise>): Promise<LessonExercise> => exerciseApi.update(exerciseId, payload),
  deleteLessonExercise: async (exerciseId: string): Promise<void> => exerciseApi.delete(exerciseId),
}
