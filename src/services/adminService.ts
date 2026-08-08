import api from './api'
import type {
  AdminStatistics,
  QuestionItem,
  QuestionQuery,
  QuestionsResponseData,
  TestConfigPayload,
  TestItem,
  UserAdminItem,
} from '../types/admin'
import type { TestSubmissionResultData } from '../types/test'

export const adminService = {
  // 1. Statistics
  getStatistics: async (): Promise<AdminStatistics> => {
    try {
      const response = await api.get<{ success: boolean; data: AdminStatistics }>('/admin/statistics')
      if (response.data.success && response.data.data) {
        return response.data.data
      }
    } catch (err) {
      console.warn('Fallback to default admin stats:', err)
    }

    // Mock fallback if backend API is not yet populated
    return {
      totalQuestions: 532,
      totalTests: 12,
      totalUsers: 1284,
      totalResults: 856,
      totalVocabularies: 350,
      questionsByLevel: {
        A1: 120,
        A2: 90,
        B1: 70,
        B2: 110,
        C1: 80,
        C2: 62,
      },
      recentUsers: [
        { _id: 'u1', name: 'Max Mustermann', email: 'max@example.com', role: 'user', createdAt: '2026-08-08T09:30:00.000Z' },
        { _id: 'u2', name: 'Anna Schmidt', email: 'anna@example.com', role: 'user', createdAt: '2026-08-08T08:15:00.000Z' },
        { _id: 'u3', name: 'Lukas Weber', email: 'lukas@example.com', role: 'user', createdAt: '2026-08-07T14:20:00.000Z' },
        { _id: 'u4', name: 'Sophie Becker', email: 'sophie@example.com', role: 'admin', createdAt: '2026-08-06T11:45:00.000Z' },
        { _id: 'u5', name: 'Leon Fischer', email: 'leon@example.com', role: 'user', createdAt: '2026-08-05T16:10:00.000Z' },
      ],
    }
  },

  // 2. Question Bank
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
      if (response.data.success && response.data.data) {
        return response.data.data
      }
    } catch (err) {
      console.warn('Fallback to mock questions list:', err)
    }

    // Mock fallback questions
    return {
      questions: [
        {
          _id: 'q1',
          level: 'A1',
          topic: 'Begrüßung',
          type: 'multiple_choice',
          question: 'Wie heißt du?',
          options: [
            { text: 'Ich heiße Anna.', isCorrect: true },
            { text: 'Ich bin 20 Jahre.', isCorrect: false },
            { text: 'Ich komme aus Deutschland.', isCorrect: false },
            { text: 'Ich wohne in Berlin.', isCorrect: false },
          ],
          explanation: 'Die richtige Antwort ist: Ich heiße Anna.',
          difficulty: 'easy',
          skill: 'grammar',
          status: 'active',
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'q2',
          level: 'A1',
          topic: 'Einkaufen',
          type: 'multiple_choice',
          question: 'Wie viel _____ der Apfel?',
          options: [
            { text: 'kostet', isCorrect: true },
            { text: 'kaufen', isCorrect: false },
            { text: 'trinken', isCorrect: false },
            { text: 'essen', isCorrect: false },
          ],
          explanation: 'Động từ "kosten" ở ngôi thứ 3 số ít chia thành "kostet".',
          difficulty: 'easy',
          skill: 'vocabulary',
          status: 'active',
          createdAt: new Date().toISOString(),
        },
      ],
      pagination: {
        page: query.page || 1,
        limit: query.limit || 20,
        total: 2,
        pages: 1,
      },
    }
  },

  createQuestion: async (payload: Omit<QuestionItem, '_id' | 'createdAt'>): Promise<QuestionItem> => {
    const response = await api.post<{ success: boolean; data: QuestionItem }>('/questions', payload)
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    return { ...payload, _id: `q_${Date.now()}`, createdAt: new Date().toISOString() }
  },

  updateQuestion: async (id: string, payload: Partial<QuestionItem>): Promise<QuestionItem> => {
    const response = await api.put<{ success: boolean; data: QuestionItem }>(`/questions/${id}`, payload)
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    return { _id: id, ...payload } as QuestionItem
  },

  deleteQuestion: async (id: string): Promise<void> => {
    await api.delete(`/questions/${id}`)
  },

  // 3. Test Configuration
  createTest: async (payload: TestConfigPayload): Promise<TestItem> => {
    const response = await api.post<{ success: boolean; data: TestItem }>('/tests', payload)
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    return { ...payload, _id: `t_${Date.now()}`, createdAt: new Date().toISOString() }
  },

  getTests: async (): Promise<TestItem[]> => {
    try {
      const response = await api.get<{ success: boolean; data: TestItem[] }>('/tests')
      if (response.data.success && response.data.data) {
        return response.data.data
      }
    } catch (err) {
      console.warn('Fallback tests list:', err)
    }

    return [
      {
        _id: 't1',
        name: 'Quick Test A1',
        level: 'A1',
        totalQuestions: 30,
        config: { vocabulary: 10, grammar: 10, reading: 10, listening: 0 },
        difficultyRatio: { easy: 40, medium: 40, hard: 20 },
        timeLimit: 30,
        passingScore: 70,
        status: 'active',
        createdAt: '2026-08-08T10:00:00.000Z',
      },
      {
        _id: 't2',
        name: 'Full Assessment A2',
        level: 'A2',
        totalQuestions: 40,
        config: { vocabulary: 15, grammar: 15, reading: 10, listening: 0 },
        difficultyRatio: { easy: 30, medium: 50, hard: 20 },
        timeLimit: 45,
        passingScore: 75,
        status: 'active',
        createdAt: '2026-08-07T12:00:00.000Z',
      },
    ]
  },

  // 4. Users Management
  getUsers: async (page = 1, limit = 20): Promise<{ users: UserAdminItem[]; pagination: { page: number; limit: number; total: number; pages: number } }> => {
    try {
      const response = await api.get<{ success: boolean; data: { users: UserAdminItem[]; pagination: { page: number; limit: number; total: number; pages: number } } }>(
        `/admin/users?page=${page}&limit=${limit}`,
      )
      if (response.data.success && response.data.data) {
        return response.data.data
      }
    } catch (err) {
      console.warn('Fallback users list:', err)
    }

    return {
      users: [
        { _id: 'u1', name: 'Max Mustermann', email: 'max@example.com', role: 'user', status: 'active', isVerified: true, createdAt: '2026-08-08T09:30:00.000Z' },
        { _id: 'u2', name: 'Anna Schmidt', email: 'anna@example.com', role: 'user', status: 'active', isVerified: true, createdAt: '2026-08-08T08:15:00.000Z' },
        { _id: 'u3', name: 'Admin DeutschUp', email: 'admin@deutschup.com', role: 'admin', status: 'active', isVerified: true, createdAt: '2026-08-01T00:00:00.000Z' },
      ],
      pagination: { page: 1, limit: 20, total: 3, pages: 1 },
    }
  },

  updateUserRole: async (userId: string, role: 'user' | 'admin'): Promise<void> => {
    await api.put(`/admin/users/${userId}/role`, { role })
  },

  toggleUserStatus: async (userId: string): Promise<void> => {
    await api.patch(`/admin/users/${userId}/toggle-status`)
  },

  // 5. Test Results History
  getAllResults: async (page = 1, limit = 20): Promise<{ results: TestSubmissionResultData[]; pagination: { page: number; limit: number; total: number; pages: number } }> => {
    try {
      const response = await api.get<{ success: boolean; data: { results: TestSubmissionResultData[]; pagination: { page: number; limit: number; total: number; pages: number } } }>(
        `/test-results?page=${page}&limit=${limit}`,
      )
      if (response.data.success && response.data.data) {
        return response.data.data
      }
    } catch (err) {
      console.warn('Fallback test results:', err)
    }

    return {
      results: [
        {
          _id: 'r1',
          testName: 'Quick Test A1',
          score: 24,
          total: 30,
          percentage: 80,
          evaluatedLevel: 'A1',
          skillBreakdown: {
            vocabulary: { correct: 9, total: 10, percentage: 90 },
            grammar: { correct: 6, total: 10, percentage: 60 },
            reading: { correct: 9, total: 10, percentage: 90 },
          },
          weaknesses: ['grammar'],
          answers: [],
          createdAt: '2026-08-08T10:00:00.000Z',
          userId: { _id: 'u1', name: 'Max Mustermann', email: 'max@example.com' },
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, pages: 1 },
    }
  },
}
