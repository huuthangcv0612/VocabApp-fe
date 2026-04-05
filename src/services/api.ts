import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
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
    const response = await api.get(`/vocabulary/lektion/${lektionId}`)
    const responseData = response.data as ApiResponse<Vocabulary> | Vocabulary[]

    if (Array.isArray(responseData)) {
      return responseData
    }

    if (!responseData.success) {
      throw new Error(responseData.error || 'Failed to fetch vocabulary')
    }

    return responseData.data
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

export default api