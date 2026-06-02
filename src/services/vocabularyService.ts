import api, { ApiResponse } from './api'
import type { Vocabulary } from './api'

export const vocabularyService = {
  getVocabularyList: async () => {
    const response = await api.get<ApiResponse<Vocabulary>>('/vocabulary')

    if (!response.data.success) {
      throw new Error(response.data.error || 'Không thể tải danh sách từ vựng')
    }

    return response.data.data
  },
}
