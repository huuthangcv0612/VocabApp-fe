import axios from 'axios'
import type { AuthUser } from '../types/auth'

const clearExpiredAuth = () => {
  localStorage.removeItem('vocabapp_token')
  localStorage.removeItem('vocabapp_user')
  delete api.defaults.headers.common.Authorization
}

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const STORAGE_TOKEN_KEY = 'vocabapp_token'

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

// Types for API responses
export interface Level {
  _id: string
  level_name: string
  description: string
  order: number
  createdAt?: string
  updatedAt?: string
}

export interface Topic {
  _id: string
  topic_name: string
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
  totalLearnedWords: number
  totalWords: number
  levelProgress: LevelProgressItem[]
  topicProgress: TopicProgressItem[]
}

export interface VocabularyExample {
  de?: string
  vi?: string
}

export interface Vocabulary {
  _id: string
  lektionId: Lektion | string
  word: string
  type: 'noun' | 'verb' | 'adjective' | 'adverb' | 'other'
  meaning: string
  example?: VocabularyExample | string
  createdAt?: string
  updatedAt?: string
}

export interface ApiResponse<T> {
  success: boolean
  count?: number
  data: T[]
  error?: string
}

interface VocabularyListApiResponse {
  success: boolean
  message?: string
  data?: {
    vocabularies: Vocabulary[]
    pagination?: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
  error?: string
}

// API functions
export const levelsApi = {
  getAll: async (): Promise<Level[]> => {
    try {
      const response = await api.get<any>('/levels')
      console.log('GET /levels response:', response.data)
      const resData = response.data

      if (Array.isArray(resData)) return resData
      if (Array.isArray(resData?.data)) return resData.data
      if (Array.isArray(resData?.levels)) return resData.levels
      if (Array.isArray(resData?.data?.levels)) return resData.data.levels
      if (Array.isArray(resData?.data?.docs)) return resData.data.docs

      if (resData && typeof resData === 'object') {
        for (const key of Object.keys(resData)) {
          if (Array.isArray(resData[key])) {
            return resData[key]
          }
        }
      }

      return []
    } catch (err) {
      console.error('Failed to fetch levels:', err)
      throw err
    }
  },

  getById: async (id: string): Promise<Level> => {
    const response = await api.get<any>(`/levels/${id}`)
    return response.data?.data || response.data
  },

  getByName: async (name: string): Promise<Level> => {
    const response = await api.get<any>(`/levels/name/${name}`)
    return response.data?.data || response.data
  },
}

export const topicsApi = {
  getAll: async (levelId?: string): Promise<Topic[]> => {
    try {
      const url = levelId ? `/topics?levelId=${encodeURIComponent(levelId)}` : '/topics'
      const response = await api.get<any>(url)
      if (response.data?.success) {
        return Array.isArray(response.data.data) ? response.data.data : response.data.data?.topics || []
      }
      if (Array.isArray(response.data)) return response.data
      return response.data?.topics || response.data?.data || []
    } catch (err) {
      console.error('Failed to fetch topics:', err)
      return []
    }
  },

  getByLevelId: async (levelId: string): Promise<Topic[]> => {
    return topicsApi.getAll(levelId)
  },

  getLektionsByTopic: async (topicId: string, levelId?: string): Promise<LektionWithProgress[]> => {
    try {
      const queryParams = new URLSearchParams()
      if (levelId) queryParams.append('levelId', levelId)
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''

      const response = await api.get<any>(`/topics/${topicId}/lektions${queryString}`)
      if (response.data?.success) {
        return Array.isArray(response.data.data) ? response.data.data : response.data.data?.lektions || []
      }
      if (Array.isArray(response.data)) return response.data
    } catch {
      // Fallback endpoint
      try {
        const response = await api.get<any>(`/lektions?topicId=${topicId}${levelId ? `&levelId=${levelId}` : ''}`)
        if (response.data?.success && Array.isArray(response.data.data)) {
          return response.data.data
        }
      } catch (err) {
        console.error('Failed to fetch lektions by topic:', err)
      }
    }
    return []
  },
}

export const lektionsApi = {
  getAll: async (): Promise<Lektion[]> => {
    const response = await api.get<ApiResponse<Lektion>>('/lektions')
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch lektions')
    }
    return response.data.data
  },

  getById: async (id: string): Promise<LektionWithProgress> => {
    const response = await api.get<any>(`/lektions/${id}`)
    if (response.data?.success && response.data?.data) {
      return response.data.data
    }
    return response.data
  },

  getByLevelId: async (levelId: string): Promise<Lektion[]> => {
    const response = await api.get<ApiResponse<Lektion>>(`/lektions/level/${levelId}`)
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch lektions')
    }
    return response.data.data
  },
}

export const vocabularyApi = {
  getAll: async (): Promise<Vocabulary[]> => {
    try {
      const response = await api.get<any>('/vocabularies')
      if (response.data.success) {
        if (Array.isArray(response.data.data)) {
          return response.data.data
        }
        if (response.data.data?.vocabularies && Array.isArray(response.data.data.vocabularies)) {
          return response.data.data.vocabularies
        }
      }
    } catch {
      // Fallback to legacy endpoint if /vocabularies is unavailable
    }

    const response = await api.get<ApiResponse<Vocabulary>>('/vocabulary')
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch vocabulary')
    }
    return response.data.data
  },

  getById: async (id: string): Promise<Vocabulary> => {
    const response = await api.get<Vocabulary>(`/vocabulary/${id}`)
    return response.data
  },

  getByLektionId: async (lektionId: string): Promise<Vocabulary[]> => {
    try {
      const response = await api.get<any>(`/vocabularies/lektion/${lektionId}`)
      if (response.data?.success) {
        if (Array.isArray(response.data.data)) return response.data.data
        if (response.data.data?.vocabularies && Array.isArray(response.data.data.vocabularies)) {
          return response.data.data.vocabularies
        }
      }
      if (Array.isArray(response.data)) return response.data
    } catch {
      // Fallback
    }

    const response = await api.get<VocabularyListApiResponse>(`/vocabularies?lektionId=${encodeURIComponent(lektionId)}`)

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch vocabulary for lektion')
    }

    return response.data.data?.vocabularies ?? []
  },

  search: async (keyword: string): Promise<Vocabulary[]> => {
    const response = await api.get<ApiResponse<Vocabulary>>(`/vocabulary/search?q=${keyword}`)
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to search vocabulary')
    }
    return response.data.data
  },

  getByType: async (type: string): Promise<Vocabulary[]> => {
    const response = await api.get<ApiResponse<Vocabulary>>(`/vocabulary/type/${type}`)
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch vocabulary by type')
    }
    return response.data.data
  },

  getSentenceFeedback: async (word: string, sentence: string): Promise<string> => {
    const response = await api.post('/ai/check-german-sentence', { word, sentence })
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to get feedback')
    }

    const { correct, corrected, errors } = response.data.data
    let feedback = ''

    if (correct) {
      feedback = 'Tuyệt vời! Câu của bạn hoàn toàn chính xác. 🎉'
    } else {
      feedback = `Câu của bạn có một số lỗi:\n\n`
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
  learnWord: async (lektionId: string, vocabularyId: string): Promise<{ success: boolean; progress?: LektionProgress }> => {
    try {
      const response = await api.post(`/progress/lektion/${lektionId}/learn-word`, { vocabularyId })
      return response.data
    } catch (err) {
      console.error('Error recording learn-word progress:', err)
      return { success: false }
    }
  },

  completeLektion: async (lektionId: string): Promise<{ success: boolean; progress?: LektionProgress }> => {
    try {
      const response = await api.post(`/progress/lektion/${lektionId}/complete`)
      return response.data
    } catch (err) {
      console.error('Error marking lektion complete:', err)
      return { success: false }
    }
  },

  getOverview: async (): Promise<ProgressOverview | null> => {
    try {
      const response = await api.get<any>('/progress')
      if (response.data?.success) {
        return response.data.data
      }
      return response.data
    } catch (err) {
      console.error('Error fetching progress overview:', err)
      return null
    }
  },
}

export interface AuthResponse<T = unknown> {
  success: boolean
  token?: string
  user?: T
  data?: T
  error?: string
  message?: string
}

export const authApi = {
  register: async (name: string, email: string, password: string, passwordConfirm: string) => {
    const response = await api.post<AuthResponse<AuthUser>>('/auth/register', {
      name,
      email,
      password,
      passwordConfirm,
    })

    console.log('REGISTER RESPONSE:', response)
    console.log('REGISTER DATA:', response.data)

    // Check if response indicates success: either HTTP 200/201 or success field is true
    const isSuccess = response.status === 200 || response.status === 201 || response.data.success === true
    if (!isSuccess) {
      throw new Error(response.data.error || response.data.message || 'Đăng ký thất bại, vui lòng thử lại.')
    }

    // Extract user data - might be in user or data field
    const user = response.data.user ?? response.data.data
    if (!user) {
      throw new Error('Đăng ký thất bại: không nhận được dữ liệu user.')
    }

    return {
      token: response.data.token || '',
      user,
    }
  },

  login: async (email: string, password: string) => {
    const response = await api.post<AuthResponse<AuthUser>>('/auth/login', {
      email,
      password,
    })

    console.log('LOGIN RESPONSE:', response)
    console.log('LOGIN DATA:', response.data)

    const isSuccess = response.status === 200 || response.status === 201 || response.data.success === true
    if (!isSuccess) {
      throw new Error(response.data.error || response.data.message || 'Đăng nhập thất bại, vui lòng kiểm tra email và mật khẩu.')
    }

    const user = response.data.user ?? response.data.data
    if (!user) {
      throw new Error('Đăng nhập thất bại: không nhận được dữ liệu user.')
    }

    return {
      token: response.data.token || '',
      user,
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
      confirmPassword: passwordConfirm,
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

  getCurrentUser: async () => {
    const response = await api.get<AuthResponse<AuthUser>>('/auth/me')
    if (!response.data.success) {
      throw new Error(response.data.error || response.data.message || 'Không thể lấy thông tin người dùng.')
    }
    return response.data
  },
}

export default api