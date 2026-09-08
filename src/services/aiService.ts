import api from './api'
import type { ApiResponse } from '../types/api'
import type {
  EvaluateSentenceResponse,
  CheckGermanSentenceResponse,
  GenerateQuestionResponse,
  AnalyzeErrorsResponse,
} from '../types/ai'

export const aiService = {
  evaluateSentence: async (
    sentence: string,
    vocabulary?: string,
    context?: string,
  ): Promise<EvaluateSentenceResponse> => {
    const response = await api.post<ApiResponse<EvaluateSentenceResponse>>('/ai/evaluate-sentence', {
      sentence,
      vocabulary,
      context,
    })
    return response.data.data
  },

  checkGermanSentence: async (sentence: string): Promise<CheckGermanSentenceResponse> => {
    const response = await api.post<ApiResponse<CheckGermanSentenceResponse>>('/ai/check-german-sentence', {
      sentence,
    })
    return response.data.data
  },

  generateQuestion: async (vocabulary: string, level: string): Promise<GenerateQuestionResponse> => {
    const response = await api.post<ApiResponse<GenerateQuestionResponse>>('/ai/generate-question', {
      vocabulary,
      level,
    })
    return response.data.data
  },

  analyzeErrors: async (sentences: string[], vocabulary?: string[]): Promise<AnalyzeErrorsResponse> => {
    const response = await api.post<ApiResponse<AnalyzeErrorsResponse>>('/ai/analyze-errors', {
      sentences,
      vocabulary,
    })
    return response.data.data
  },
}
