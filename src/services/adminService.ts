import api from './api'
import { levelApi } from './levelApi'
import { topicApi } from './topicApi'
import { unitApi } from './unitApi'
import { lessonApi } from './lessonApi'
import { vocabularyApi } from './vocabularyApi'
import { exerciseApi } from './exerciseApi'
import type { ApiResponse } from '../types/api'
import type { TestSubmissionResultData } from '../types/test'

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
    const response = await api.get<ApiResponse<AdminStatistics>>('/admin/statistics')
    return response.data.data
  },

  // 2. Question Bank CRUD
  getQuestions: async (query: QuestionQuery = {}): Promise<QuestionsResponseData> => {
    const params = new URLSearchParams()
    if (query.level) params.append('level', query.level)
    if (query.skill) params.append('skill', query.skill)
    if (query.difficulty) params.append('difficulty', query.difficulty)
    if (query.status) params.append('status', query.status)
    if (query.q) params.append('q', query.q)
    if (query.page) params.append('page', String(query.page))
    if (query.limit) params.append('limit', String(query.limit))

    const response = await api.get<ApiResponse<QuestionsResponseData>>(`/questions?${params.toString()}`)
    return response.data.data
  },

  createQuestion: async (payload: Partial<QuestionItem>): Promise<QuestionItem> => {
    const response = await api.post<ApiResponse<QuestionItem>>('/questions', payload)
    return response.data.data
  },

  updateQuestion: async (id: string, payload: Partial<QuestionItem>): Promise<QuestionItem> => {
    const response = await api.put<ApiResponse<QuestionItem>>(`/questions/${encodeURIComponent(id)}`, payload)
    return response.data.data
  },

  deleteQuestion: async (id: string): Promise<void> => {
    await api.delete(`/questions/${encodeURIComponent(id)}`)
  },

  // 3. Test Config CRUD
  getTests: async (): Promise<TestItem[]> => {
    const response = await api.get<ApiResponse<TestItem[]>>('/tests')
    return Array.isArray(response.data.data) ? response.data.data : []
  },

  createTest: async (payload: TestConfigPayload): Promise<TestItem> => {
    const response = await api.post<ApiResponse<TestItem>>('/tests', payload)
    return response.data.data
  },

  updateTest: async (id: string, payload: Partial<TestConfigPayload>): Promise<TestItem> => {
    const response = await api.put<ApiResponse<TestItem>>(`/tests/${encodeURIComponent(id)}`, payload)
    return response.data.data
  },

  deleteTest: async (id: string): Promise<void> => {
    await api.delete(`/tests/${encodeURIComponent(id)}`)
  },

  // 4. User Management
  getUsers: async (): Promise<UserAdminItem[]> => {
    const response = await api.get<ApiResponse<UserAdminItem[]>>('/admin/users')
    return Array.isArray(response.data.data) ? response.data.data : []
  },

  updateUserRole: async (id: string, role: string): Promise<UserAdminItem> => {
    const response = await api.put<ApiResponse<{ user: UserAdminItem } | UserAdminItem>>(`/admin/users/${encodeURIComponent(id)}/role`, { role })
    const resData = response.data.data
    if ('user' in resData) return resData.user
    return resData
  },

  toggleUserStatus: async (id: string): Promise<UserAdminItem> => {
    const response = await api.patch<ApiResponse<{ user: UserAdminItem } | UserAdminItem>>(`/admin/users/${encodeURIComponent(id)}/toggle-status`)
    const resData = response.data.data
    if ('user' in resData) return resData.user
    return resData
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${encodeURIComponent(id)}`)
  },

  // 5. Test Results
  getResults: async (): Promise<{ results: TestSubmissionResultData[]; pagination: PaginationMeta }> => {
    const response = await api.get<ApiResponse<{ results: TestSubmissionResultData[]; pagination: PaginationMeta }>>('/test-results')
    return response.data.data
  },

  getAllResults: async (): Promise<{ results: TestSubmissionResultData[]; pagination: PaginationMeta }> => adminService.getResults(),

  // 6. Level CRUD
  getLevels: async (): Promise<LevelItem[]> => levelApi.getAll(),
  createLevel: async (payload: Partial<LevelItem>): Promise<LevelItem> => levelApi.create(payload as unknown as Parameters<typeof levelApi.create>[0]),
  updateLevel: async (id: string, payload: Partial<LevelItem>): Promise<LevelItem> => levelApi.update(id, payload),
  deleteLevel: async (id: string): Promise<void> => levelApi.delete(id),

  // 7. Topic CRUD
  getTopics: async (levelId?: string): Promise<TopicItem[]> => topicApi.getAll({ levelId }),
  createTopic: async (payload: Partial<TopicItem>): Promise<TopicItem> => topicApi.create(payload as unknown as Parameters<typeof topicApi.create>[0]),
  updateTopic: async (id: string, payload: Partial<TopicItem>): Promise<TopicItem> => topicApi.update(id, payload),
  deleteTopic: async (id: string): Promise<void> => topicApi.delete(id),

  // 8. Unit CRUD
  getUnits: async (topicId?: string): Promise<UnitItem[]> => unitApi.getAll({ topicId }),
  createUnit: async (payload: Partial<UnitItem>): Promise<UnitItem> => unitApi.create(payload as unknown as Parameters<typeof unitApi.create>[0]),
  updateUnit: async (id: string, payload: Partial<UnitItem>): Promise<UnitItem> => unitApi.update(id, payload),
  deleteUnit: async (id: string): Promise<void> => unitApi.delete(id),

  // 9. Lesson CRUD
  getLessons: async (unitId?: string): Promise<LessonItem[]> => lessonApi.getAll({ unit_id: unitId }),
  createLesson: async (payload: Partial<LessonItem>): Promise<LessonItem> => lessonApi.create(payload),
  updateLesson: async (id: string, payload: Partial<LessonItem>): Promise<LessonItem> => lessonApi.update(id, payload),
  deleteLesson: async (id: string): Promise<void> => lessonApi.delete(id),

  // 10. Vocabulary CRUD
  getVocabularies: async (
    query: { q?: string; level?: string; page?: number; limit?: number; lektionId?: string } = {},
  ): Promise<{ vocabularies: VocabularyAdminItem[]; pagination: PaginationMeta }> => vocabularyApi.getAll(query),
  createVocabulary: async (payload: Partial<VocabularyAdminItem>): Promise<VocabularyAdminItem> => vocabularyApi.create(payload as unknown as Parameters<typeof vocabularyApi.create>[0]),
  updateVocabulary: async (id: string, payload: Partial<VocabularyAdminItem>): Promise<VocabularyAdminItem> => vocabularyApi.update(id, payload as unknown as Parameters<typeof vocabularyApi.update>[1]),
  deleteVocabulary: async (id: string): Promise<void> => vocabularyApi.delete(id),

  // 11. Lesson Builder Services
  getLessonDetail: async (lessonId: string): Promise<LessonDetailData> => lessonApi.getAdminDetail(lessonId),

  addVocabularyToLesson: async (
    lessonId: string,
    vocabularyId: string,
    order: number,
    is_new = true,
  ): Promise<unknown> => {
    const response = await api.post<ApiResponse<unknown>>(`/admin/lessons/${encodeURIComponent(lessonId)}/vocabularies`, {
      vocabularyId,
      order,
      is_new,
    })
    return response.data.data
  },

  removeVocabularyFromLesson: async (lessonId: string, vocabularyId: string): Promise<void> => {
    await api.delete(`/admin/lessons/${encodeURIComponent(lessonId)}/vocabularies/${encodeURIComponent(vocabularyId)}`)
  },

  updateLessonVocabulary: async (
    lessonId: string,
    vocabularyId: string,
    payload: { order?: number; is_new?: boolean },
  ): Promise<void> => {
    await api.put(`/admin/lessons/${encodeURIComponent(lessonId)}/vocabularies/order`, {
      items: [{ vocabularyId, ...payload }],
    })
  },

  reorderLessonVocabularies: async (
    lessonId: string,
    items: Array<{ vocabularyId: string; order: number }>,
  ): Promise<void> => {
    await api.put(`/admin/lessons/${encodeURIComponent(lessonId)}/vocabularies/order`, { items })
  },

  getExercises: async (): Promise<LessonExercise[]> => exerciseApi.getAll(),
  createLessonExercise: async (lessonId: string, payload: Partial<LessonExercise>): Promise<LessonExercise> => exerciseApi.create(lessonId, payload),
  updateLessonExercise: async (exerciseId: string, payload: Partial<LessonExercise>): Promise<LessonExercise> => exerciseApi.update(exerciseId, payload),
  deleteLessonExercise: async (exerciseId: string): Promise<void> => exerciseApi.delete(exerciseId),
  createExercise: async (lessonId: string, payload: Partial<LessonExercise>): Promise<LessonExercise> => exerciseApi.create(lessonId, payload),
  updateExercise: async (exerciseId: string, payload: Partial<LessonExercise>): Promise<LessonExercise> => exerciseApi.update(exerciseId, payload),
  deleteExercise: async (exerciseId: string): Promise<void> => exerciseApi.delete(exerciseId),
}
