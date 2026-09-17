import { apiClient } from '../../../services/api'
import type { ApiResponse } from '../../../services/api'
import type {
  StartConversationRequest,
  StartConversationResponseData,
  SendMessageRequest,
  SendMessageResponseData,
  CompleteConversationResponseData,
  GetConversationResponseData,
} from '../types/aiConversation'

export const aiConversationService = {
  /**
   * Start a new AI conversation session for a given lesson ID
   * POST /api/ai/conversations/start
   */
  startConversation: async (lessonId: string): Promise<StartConversationResponseData> => {
    const payload: StartConversationRequest = { lesson_id: lessonId }
    const response = await apiClient.post<ApiResponse<StartConversationResponseData>>(
      '/ai/conversations/start',
      payload,
    )
    return response.data.data
  },

  /**
   * Send a user message in an active AI conversation session
   * POST /api/ai/conversations/:sessionId/message
   */
  sendMessage: async (sessionId: string, message: string): Promise<SendMessageResponseData> => {
    const payload: SendMessageRequest = { message }
    const response = await apiClient.post<ApiResponse<SendMessageResponseData>>(
      `/ai/conversations/${encodeURIComponent(sessionId)}/message`,
      payload,
    )
    return response.data.data
  },

  /**
   * Complete an active AI conversation session
   * POST /api/ai/conversations/:sessionId/complete
   */
  completeConversation: async (sessionId: string): Promise<CompleteConversationResponseData> => {
    const response = await apiClient.post<ApiResponse<CompleteConversationResponseData>>(
      `/ai/conversations/${encodeURIComponent(sessionId)}/complete`,
      {},
    )
    return response.data.data
  },

  /**
   * Get detail of an AI conversation session (restore state on reload)
   * GET /api/ai/conversations/:sessionId
   */
  getConversation: async (sessionId: string): Promise<GetConversationResponseData> => {
    const response = await apiClient.get<ApiResponse<GetConversationResponseData>>(
      `/ai/conversations/${encodeURIComponent(sessionId)}`,
    )
    return response.data.data
  },
}
