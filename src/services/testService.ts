import api from './api'
import type { ApiResponse } from '../types/api'
import type {
  TestLearnerData,
  TestSubmissionPayload,
  TestSubmissionResultData,
} from '../types/test'
import type { LevelType, TestItem } from '../types/admin'

export const testService = {
  getQuickTest: async (level: LevelType = 'A1'): Promise<TestLearnerData> => {
    const response = await api.get<ApiResponse<{ test: TestLearnerData }>>(
      `/tests/quick-test?level=${encodeURIComponent(level)}`,
    )
    return response.data.data.test
  },

  getTests: async (): Promise<TestItem[]> => {
    const response = await api.get<ApiResponse<TestItem[] | { tests: TestItem[] }>>('/tests')
    const data = response.data.data
    if (Array.isArray(data)) return data
    if (data && typeof data === 'object' && 'tests' in data && Array.isArray(data.tests)) {
      return data.tests
    }
    return []
  },

  getTest: async (testId: string): Promise<TestItem> => {
    const response = await api.get<ApiResponse<TestItem | { test: TestItem }>>(`/tests/${encodeURIComponent(testId)}`)
    const data = response.data.data
    if (data && typeof data === 'object' && 'test' in data) {
      return data.test
    }
    return data as TestItem
  },

  startTest: async (testId: string): Promise<TestLearnerData> => {
    const response = await api.get<ApiResponse<TestLearnerData | { test: TestLearnerData }>>(`/tests/${encodeURIComponent(testId)}/start`)
    const data = response.data.data
    if (data && typeof data === 'object' && 'test' in data) {
      return data.test
    }
    return data as TestLearnerData
  },

  submitTestResult: async (payload: TestSubmissionPayload): Promise<TestSubmissionResultData> => {
    const response = await api.post<ApiResponse<{ result: TestSubmissionResultData } | TestSubmissionResultData>>(
      '/test-results',
      payload,
    )
    const data = response.data.data
    if (data && typeof data === 'object' && 'result' in data) {
      return data.result
    }
    return data as TestSubmissionResultData
  },

  getMyTestResults: async (): Promise<TestSubmissionResultData[]> => {
    const response = await api.get<ApiResponse<TestSubmissionResultData[] | { results: TestSubmissionResultData[] }>>('/test-results/my-results')
    const data = response.data.data
    if (Array.isArray(data)) return data
    if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
      return data.results
    }
    return []
  },
}
