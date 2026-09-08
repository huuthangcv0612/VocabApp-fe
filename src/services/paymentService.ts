import api from './api'
import type { ApiResponse } from '../types/api'

export const paymentService = {
  mockSuccess: async (orderId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await api.post<ApiResponse<unknown>>('/payments/mock-success', {
      orderId,
    })
    return {
      success: response.data.success,
      message: response.data.message,
    }
  },
}
