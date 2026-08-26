import axios from 'axios'
import type { AuthUser } from '../types/auth'

const STORAGE_TOKEN_KEY = 'vocabapp_token'

const clearExpiredAuth = () => {
  localStorage.removeItem(STORAGE_TOKEN_KEY)
  localStorage.removeItem('vocabapp_user')
  delete api.defaults.headers.common.Authorization
}

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(STORAGE_TOKEN_KEY, token)
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    localStorage.removeItem(STORAGE_TOKEN_KEY)
    delete api.defaults.headers.common.Authorization
  }
}

export const clearAuthToken = () => {
  localStorage.removeItem(STORAGE_TOKEN_KEY)
  delete api.defaults.headers.common.Authorization
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_TOKEN_KEY)
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearExpiredAuth()
      window.dispatchEvent(new CustomEvent('auth:logout'))
    }
    return Promise.reject(error)
  },
)

export interface Level {
  _id: string
  level_name: string
  name?: string
  description?: string
  order: number
  createdAt?: string
  updatedAt?: string
}

export interface Topic {
  _id: string
  topic_name: string
  name?: string
  slug?: string
  description?: string
  icon?: string
  order?: number
  createdAt?: string
  updatedAt?: string
}

export interface LektionProgress {
  status: 'not_started' | 'in_progress' | 'completed'
  percentage: number
  learnedWordsCount: number
}

export interface Lektion {
  _id: string
  level_id?: Level | string
  lektion_name: string
  description?: string
  order?: number
  topic?: string | Topic
  level?: string | Level
  vocabularyCount?: number
  progress?: LektionProgress
  createdAt?: string
  updatedAt?: string
}

export interface LektionWithProgress extends Lektion {
  progress?: LektionProgress
}

export interface LevelProgressItem {
  levelId: string
  levelName: string
  percentage: number
  learnedCount?: number
  totalCount?: number
}

export interface TopicProgressItem {
  topicId: string
  topicName: string
  percentage: number
  learnedCount?: number
  totalCount?: number
}

export interface ProgressOverview {
  completedLektionsCount: number
  totalLearnedWordsCount: number
  lektionProgresses: Array<{
    lektionId: string
    status: 'not_started' | 'in_progress' | 'completed'
    progress: number
    learnedWordsCount: number
    updatedAt?: string
  }>
}

export interface VocabularyExample {
  de?: string
  vi?: string
}

export interface Vocabulary {
  _id: string
  lektionId?: Lektion | string
  word: string
  article?: 'der' | 'die' | 'das' | null
  plural?: string
  type: 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase' | 'other'
  meaning: string
  pronunciation?: string
  example?: VocabularyExample | string
  translation?: string
  audio?: string
  image?: string
  difficultyLevel?: string
  createdAt?: string
  updatedAt?: string
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  statusCode?: number
  count?: number
  data: T
  error?: string
}

export interface VocabularyListResponse {
  vocabularies: Vocabulary[]
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export const levelsApi = {
  getAll: async (): Promise<Level[]> => {
    try {
      const response = await api.get<unknown>('/levels')
      const resData = response.data as Record<string, unknown> | Level[]
      if (Array.isArray(resData)) return resData as Level[]
      
      const dataObj = (resData as Record<string, unknown>)?.data || resData
      if (Array.isArray(dataObj)) return dataObj as Level[]
      if (dataObj && typeof dataObj === 'object') {
        const record = dataObj as Record<string, unknown>
        if (Array.isArray(record.levels)) return record.levels as Level[]
        if (Array.isArray(record.data)) return record.data as Level[]
      }
      if (Array.isArray((resData as Record<string, unknown>)?.levels)) {
        return (resData as Record<string, unknown>).levels as Level[]
      }
      return []
    } catch {
      return []
    }
  },

  getById: async (id: string): Promise<Level> => {
    const response = await api.get<ApiResponse<Level>>(`/levels/${id}`)
    return response.data.data
  },

  getByName: async (name: string): Promise<Level> => {
    const response = await api.get<ApiResponse<Level>>(`/levels/name/${encodeURIComponent(name)}`)
    return response.data.data
  },
}

export const topicsApi = {
  getAll: async (levelId?: string): Promise<Topic[]> => {
    const url = levelId ? `/topics/level/${encodeURIComponent(levelId)}` : '/topics'
    const response = await api.get<ApiResponse<Topic[] | { topics: Topic[] }>>(url)
    const data = response.data.data
    if (Array.isArray(data)) return data
    if (data && 'topics' in data && Array.isArray(data.topics)) return data.topics
    return []
  },

  getByLevelId: async (levelId: string): Promise<Topic[]> => {
    return topicsApi.getAll(levelId)
  },

  getLektionsByTopic: async (topicId: string, levelId?: string): Promise<LektionWithProgress[]> => {
    const queryParams = new URLSearchParams()
    if (levelId) queryParams.append('levelId', levelId)
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''

    const response = await api.get<ApiResponse<LektionWithProgress[]>>(`/topics/${encodeURIComponent(topicId)}/lektions${queryString}`)
    if (Array.isArray(response.data.data)) return response.data.data
    return []
  },
}

export const lektionsApi = {
  getAll: async (): Promise<Lektion[]> => {
    const response = await api.get<ApiResponse<Lektion[] | { lessons: Lektion[] }>>('/lessons')
    const resData = response.data.data
    if (Array.isArray(resData)) return resData
    if (resData && typeof resData === 'object' && 'lessons' in resData && Array.isArray(resData.lessons)) return resData.lessons
    return []
  },

  getById: async (id: string): Promise<LektionWithProgress> => {
    const response = await api.get<ApiResponse<LektionWithProgress | { lesson: LektionWithProgress }>>(`/lessons/${encodeURIComponent(id)}`)
    const resData = response.data.data
    if (resData && typeof resData === 'object' && 'lesson' in resData) return resData.lesson
    return resData as LektionWithProgress
  },

  getByLevelId: async (levelId: string): Promise<Lektion[]> => {
    const response = await api.get<ApiResponse<Lektion[] | { lessons: Lektion[] }>>(`/lessons?level_id=${encodeURIComponent(levelId)}`)
    const resData = response.data.data
    if (Array.isArray(resData)) return resData
    if (resData && typeof resData === 'object' && 'lessons' in resData && Array.isArray(resData.lessons)) return resData.lessons
    return []
  },
}

export const vocabularyApi = {
  getAll: async (params?: { page?: number; limit?: number; lektionId?: string; difficultyLevel?: string; type?: string; search?: string }): Promise<VocabularyListResponse> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', String(params.page))
    if (params?.limit) queryParams.append('limit', String(params.limit))
    if (params?.lektionId) queryParams.append('lektionId', params.lektionId)
    if (params?.difficultyLevel) queryParams.append('difficultyLevel', params.difficultyLevel)
    if (params?.type) queryParams.append('type', params.type)
    if (params?.search) queryParams.append('search', params.search)

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''
    const response = await api.get<ApiResponse<VocabularyListResponse | Vocabulary[]>>(`/vocabularies${queryString}`)

    if (Array.isArray(response.data.data)) {
      return { vocabularies: response.data.data }
    }
    return response.data.data
  },

  getById: async (id: string): Promise<Vocabulary> => {
    const response = await api.get<ApiResponse<Vocabulary>>(`/vocabularies/${id}`)
    return response.data.data
  },

  getByLektionId: async (lektionId: string): Promise<Vocabulary[]> => {
    const response = await api.get<ApiResponse<Vocabulary[] | VocabularyListResponse>>(`/vocabularies/lektion/${encodeURIComponent(lektionId)}`)
    if (Array.isArray(response.data.data)) return response.data.data
    if (response.data.data && 'vocabularies' in response.data.data && Array.isArray(response.data.data.vocabularies)) {
      return response.data.data.vocabularies
    }
    return []
  },

  search: async (keyword: string): Promise<Vocabulary[]> => {
    const response = await api.get<ApiResponse<{ vocabularies: Vocabulary[] } | Vocabulary[]>>(`/vocabularies/search/${encodeURIComponent(keyword)}`)
    if (Array.isArray(response.data.data)) return response.data.data
    if (response.data.data && 'vocabularies' in response.data.data) {
      return response.data.data.vocabularies
    }
    return []
  },

  getByType: async (type: string): Promise<Vocabulary[]> => {
    const response = await api.get<ApiResponse<VocabularyListResponse>>(`/vocabularies?type=${encodeURIComponent(type)}`)
    return response.data.data?.vocabularies || []
  },

  getSentenceFeedback: async (sentence: string): Promise<string> => {
    const response = await api.post<ApiResponse<{ correct: boolean; corrected: string; errors: string[] }>>('/ai/check-german-sentence', { sentence })
    const { correct, corrected, errors } = response.data.data
    let feedback = ''

    if (correct) {
      feedback = 'Tuyệt vời! Câu của bạn hoàn toàn chính xác. 🎉'
    } else {
      feedback = 'Câu của bạn có một số lỗi:\n\n'
      if (corrected) {
        feedback += `Câu đúng: "${corrected}"\n\n`
      }
      if (errors && errors.length > 0) {
        feedback += `Lỗi phát hiện: ${errors.join(', ')}\n\n`
      }
      feedback += 'Hãy thử lại với câu đúng nhé!'
    }

    return feedback
  },
}

export const progressApi = {
  startLesson: async (lessonId: string): Promise<{ success: boolean; data?: unknown }> => {
    const response = await api.post<ApiResponse<unknown>>(`/progress/lessons/${encodeURIComponent(lessonId)}/start`)
    return { success: response.data.success, data: response.data.data }
  },

  submitExercise: async (lessonId: string, exerciseId: string, answer: unknown): Promise<{ success: boolean; data?: unknown }> => {
    const response = await api.post<ApiResponse<unknown>>(`/progress/lessons/${encodeURIComponent(lessonId)}/submit-exercise`, {
      exercise_id: exerciseId,
      answer,
    })
    return { success: response.data.success, data: response.data.data }
  },

  completeLesson: async (lessonId: string): Promise<{ success: boolean; data?: unknown }> => {
    const response = await api.post<ApiResponse<unknown>>(`/progress/lessons/${encodeURIComponent(lessonId)}/complete`)
    return { success: response.data.success, data: response.data.data }
  },

  learnWord: async (lessonId: string, _vocabularyId?: string, _isCorrect?: boolean): Promise<{ success: boolean; data?: unknown }> => {
    return progressApi.startLesson(lessonId)
  },

  completeLektion: async (lessonId: string): Promise<{ success: boolean; data?: unknown }> => {
    return progressApi.completeLesson(lessonId)
  },

  getOverview: async (): Promise<ProgressOverview | null> => {
    const response = await api.get<ApiResponse<{ lessonProgresses?: ProgressOverview['lektionProgresses']; lektionProgresses?: ProgressOverview['lektionProgresses']; stats: { completedLessonsCount?: number; completedLektionsCount?: number; totalLearnedWordsCount: number } }>>('/progress')
    const resData = response.data.data
    if (!resData) return null

    return {
      completedLektionsCount: resData.stats?.completedLessonsCount || resData.stats?.completedLektionsCount || 0,
      totalLearnedWordsCount: resData.stats?.totalLearnedWordsCount || 0,
      lektionProgresses: resData.lessonProgresses || resData.lektionProgresses || [],
    }
  },
}

export interface AuthResponse<T = unknown> {
  success: boolean
  message?: string
  statusCode?: number
  token?: string
  user?: T
  data?: T | { token?: string; user?: T }
  error?: string
}

export const authApi = {
  register: async (name: string, email: string, password: string, passwordConfirm: string) => {
    const response = await api.post<AuthResponse<AuthUser>>('/auth/register', {
      name,
      email,
      password,
      passwordConfirm,
    })

    if (!response.data.success) {
      throw new Error(response.data.error || response.data.message || 'Đăng ký thất bại, vui lòng thử lại.')
    }

    const userData = response.data.user || (typeof response.data.data === 'object' && response.data.data !== null && 'user' in response.data.data ? response.data.data.user : response.data.data) as AuthUser | undefined

    return {
      token: response.data.token || (typeof response.data.data === 'object' && response.data.data !== null && 'token' in response.data.data ? response.data.data.token : '') || '',
      user: userData as AuthUser,
    }
  },

  login: async (email: string, password: string) => {
    const response = await api.post<AuthResponse<AuthUser>>('/auth/login', {
      email,
      password,
    })

    if (!response.data.success) {
      throw new Error(response.data.error || response.data.message || 'Đăng nhập thất bại, vui lòng kiểm tra email và mật khẩu.')
    }

    const userData = response.data.user || (typeof response.data.data === 'object' && response.data.data !== null && 'user' in response.data.data ? response.data.data.user : response.data.data) as AuthUser | undefined

    return {
      token: response.data.token || (typeof response.data.data === 'object' && response.data.data !== null && 'token' in response.data.data ? response.data.data.token : '') || '',
      user: userData as AuthUser,
    }
  },

  verifyEmail: async (token: string) => {
    const response = await api.get<AuthResponse<null>>(`/auth/verify-email?token=${encodeURIComponent(token)}`)
    if (!response.data.success) {
      throw new Error(response.data.error || response.data.message || 'Xác thực email thất bại.')
    }
  },

  forgotPassword: async (email: string) => {
    const response = await api.post<AuthResponse<null>>('/auth/forgot-password', { email })
    if (!response.data.success) {
      throw new Error(response.data.error || response.data.message || 'Không thể gửi yêu cầu đặt lại mật khẩu.')
    }
  },

  resetPassword: async (token: string, password: string, passwordConfirm: string) => {
    const response = await api.post<AuthResponse<null>>('/auth/reset-password', {
      token,
      password,
      passwordConfirm,
    })
    if (!response.data.success) {
      throw new Error(response.data.error || response.data.message || 'Không thể đặt lại mật khẩu.')
    }
  },

  changePassword: async (oldPassword: string, newPassword: string, confirmPassword: string) => {
    const response = await api.post<AuthResponse<null>>('/auth/change-password', {
      oldPassword,
      newPassword,
      confirmPassword,
    })
    if (!response.data.success) {
      throw new Error(response.data.error || response.data.message || 'Không thể đổi mật khẩu.')
    }
  },

  getCurrentUser: async (): Promise<AuthUser> => {
    const response = await api.get<AuthResponse<AuthUser>>('/auth/me')
    if (!response.data.success) {
      throw new Error(response.data.error || response.data.message || 'Không thể lấy thông tin người dùng.')
    }
    const userObj = response.data.user || (typeof response.data.data === 'object' && response.data.data !== null && 'user' in response.data.data ? response.data.data.user : response.data.data) as AuthUser
    return userObj
  },
}

export default api