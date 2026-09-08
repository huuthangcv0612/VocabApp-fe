import axios from 'axios'

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

export const apiClient = api

export { authApi } from './authApi'
export { levelApi as levelsApi, levelApi } from './levelApi'
export { topicApi as topicsApi, topicApi } from './topicApi'
export { unitApi } from './unitApi'
export { lessonApi as lektionsApi, lessonApi } from './lessonApi'
export { exerciseApi } from './exerciseApi'
export { vocabularyApi } from './vocabularyApi'
export { progressService as progressApi, progressService } from './progressService'
export { aiService } from './aiService'
export { questionApi } from './questionApi'
export { testService } from './testService'
export { paymentService } from './paymentService'
export { subscriptionService } from './subscriptionService'

export default api