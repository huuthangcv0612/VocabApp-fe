import api from './api'
import type {
  TestLearnerData,
  TestSubmissionPayload,
  TestSubmissionResultData,
} from '../types/test'
import type { LevelType } from '../types/admin'

export const testService = {
  getQuickTest: async (level: LevelType = 'A1'): Promise<TestLearnerData> => {
    try {
      const response = await api.get<{ success: boolean; data: { test: TestLearnerData } }>(
        `/tests/quick-test?level=${level}`,
      )

      if (response.data.success && response.data.data?.test) {
        return response.data.data.test
      }
    } catch (err) {
      console.warn('Fallback to default learner test questions:', err)
    }

    // Mock secure test data (NO isCorrect or explanation)
    return {
      testId: 'quick-test',
      testName: `Quick Test ${level}`,
      level,
      totalQuestions: 5,
      questions: [
        {
          _id: '66b1001',
          level,
          topic: 'Begrüßung',
          type: 'multiple_choice',
          question: 'Wie heißt du?',
          difficulty: 'easy',
          skill: 'grammar',
          options: [
            'Ich heiße Anna.',
            'Ich bin 20 Jahre.',
            'Ich komme Deutsch.',
            'Ich wohnen Berlin.',
          ],
        },
        {
          _id: '66b1002',
          level,
          topic: 'Einkaufen',
          type: 'multiple_choice',
          question: 'Wie viel _____ der Apfel?',
          difficulty: 'easy',
          skill: 'vocabulary',
          options: ['kostet', 'kaufen', 'trinken', 'essen'],
        },
        {
          _id: '66b1003',
          level,
          topic: 'Freizeit',
          type: 'multiple_choice',
          question: 'Ich _____ am Wochenende gern Fußball.',
          difficulty: 'easy',
          skill: 'grammar',
          options: ['spiele', 'spielt', 'spielen', 'gehe'],
        },
        {
          _id: '66b1004',
          level,
          topic: 'Familie',
          type: 'multiple_choice',
          question: 'Das ist _____ Mutter.',
          difficulty: 'medium',
          skill: 'reading',
          options: ['meine', 'mein', 'meinem', 'meinen'],
        },
        {
          _id: '66b1005',
          level,
          topic: 'Wohnen',
          type: 'multiple_choice',
          question: 'Wo _____ du?',
          difficulty: 'easy',
          skill: 'vocabulary',
          options: ['wohnst', 'wohne', 'wohnen', 'wohnt'],
        },
      ],
    }
  },

  submitTestResult: async (payload: TestSubmissionPayload): Promise<TestSubmissionResultData> => {
    try {
      const response = await api.post<{ success: boolean; data: { result: TestSubmissionResultData } }>(
        '/test-results',
        payload,
      )

      if (response.data.success && response.data.data?.result) {
        return response.data.data.result
      }
    } catch (err) {
      console.warn('Fallback test submission result evaluation:', err)
    }

    // Mock evaluation result matching backend specs
    const correctCount = payload.answers.filter((a) => a.selectedOption === 0).length
    const totalCount = payload.answers.length || 5
    const percentage = Math.round((correctCount / totalCount) * 100)

    return {
      _id: `res_${Date.now()}`,
      testId: payload.testId,
      testName: payload.testName,
      score: correctCount,
      total: totalCount,
      percentage,
      evaluatedLevel: payload.level,
      skillBreakdown: {
        vocabulary: { correct: 2, total: 2, percentage: 100 },
        grammar: { correct: 1, total: 2, percentage: 50 },
        reading: { correct: 1, total: 1, percentage: 100 },
      },
      weaknesses: ['grammar'],
      answers: payload.answers.map((ans) => ({
        questionId: ans.questionId,
        selectedOption: ans.selectedOption,
        isCorrect: ans.selectedOption === 0,
        correctAnswer: 'Đáp án đúng thứ 1',
        explanation: 'Die richtige Antwort ist câu trả lời chuẩn tiếng Đức.',
      })),
      createdAt: new Date().toISOString(),
    }
  },
}
