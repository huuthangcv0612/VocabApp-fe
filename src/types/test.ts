import { LevelType, SkillType } from './admin'

export interface TestLearnerQuestion {
  _id: string
  level: LevelType
  topic: string
  type: string
  question: string
  difficulty: string
  skill: SkillType
  options: string[]
}

export interface TestLearnerData {
  testId: string
  testName: string
  level: LevelType
  totalQuestions: number
  questions: TestLearnerQuestion[]
}

export interface TestLearnerAnswerInput {
  questionId: string
  selectedOption: number
}

export interface TestSubmissionPayload {
  testId: string
  testName: string
  level: LevelType
  answers: TestLearnerAnswerInput[]
}

export interface TestAnswerResultReview {
  questionId: string
  selectedOption: number
  isCorrect: boolean
  correctAnswer: string
  explanation: string
}

export interface SkillBreakdownItem {
  correct: number
  total: number
  percentage: number
}

export interface TestSubmissionResultData {
  _id: string
  testId?: string
  testName?: string
  score: number
  total: number
  percentage: number
  evaluatedLevel: LevelType
  skillBreakdown: Partial<Record<SkillType, SkillBreakdownItem>>
  weaknesses: SkillType[]
  answers: TestAnswerResultReview[]
  createdAt?: string
  userId?: {
    _id: string
    name: string
    email: string
  }
}
