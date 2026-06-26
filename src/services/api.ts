import axios from 'axios'
import type { AuthUser } from '../types/auth'

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

// Types for API responses
export interface Level {
  _id: string
  level_name: string
  description: string
  order: number
  createdAt?: string
  updatedAt?: string
}

export interface Lektion {
  _id: string
  level_id: Level | string
  lektion_name: string
  description: string
  order: number
  createdAt?: string
  updatedAt?: string
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

// API functions
export const levelsApi = {
  getAll: async (): Promise<Level[]> => {
    const response = await api.get<ApiResponse<Level>>('/levels')
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch levels')
    }
    return response.data.data
  },

  getById: async (id: string): Promise<Level> => {
    const response = await api.get<Level>(`/levels/${id}`)
    return response.data
  },

  getByName: async (name: string): Promise<Level> => {
    const response = await api.get<Level>(`/levels/name/${name}`)
    return response.data
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

  getById: async (id: string): Promise<Lektion> => {
    const response = await api.get<Lektion>(`/lektions/${id}`)
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
    const response = await api.get('/vocabularies?limit=5000')
    const responseData = response.data as {
      success?: boolean
      data?: {
        vocabularies?: Vocabulary[]
      } | Vocabulary[]
      error?: string
    }

    const allVocabularies: Vocabulary[] =
      (responseData?.data as { vocabularies?: Vocabulary[] })?.vocabularies ||
      (responseData?.data as Vocabulary[]) ||
      (Array.isArray(responseData) ? responseData : [])

    return allVocabularies.filter(
      (vocab) => String(vocab.lektionId) === String(lektionId)
    )
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

    // Check if response indicates success: either HTTP 200/201 or success field is true
    const isSuccess = response.status === 200 || response.status === 201 || response.data.success === true
    if (!isSuccess) {
      throw new Error(response.data.error || response.data.message || 'Đăng nhập thất bại, vui lòng kiểm tra email và mật khẩu.')
    }

    // Extract user data - might be in user or data field
    const user = response.data.user ?? response.data.data
    if (!user) {
      throw new Error('Đăng nhập thất bại: không nhận được dữ liệu user.')
    }

    return {
      token: response.data.token || '',
      user,
    }
  },
}

export default api