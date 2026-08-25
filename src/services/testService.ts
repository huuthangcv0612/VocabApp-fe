import api from './api'
import type { ApiResponse } from '../types/api'
import type {
  TestLearnerData,
  TestSubmissionPayload,
  TestSubmissionResultData,
} from '../types/test'
import type { LevelType } from '../types/admin'

export const testService = {
  getQuickTest: async (level: LevelType = 'A1'): Promise<TestLearnerData> => {
    const response = await api.get<ApiResponse<{ test: TestLearnerData }>>(
      `/tests/quick-test?level=${encodeURIComponent(level)}`,
    )
    return response.data.data.test
  },

  submitTestResult: async (payload: TestSubmissionPayload): Promise<TestSubmissionResultData> => {
    const response = await api.post<ApiResponse<{ result: TestSubmissionResultData }>>(
      '/test-results',
      payload,
    )
    return response.data.data.result
  },
}
