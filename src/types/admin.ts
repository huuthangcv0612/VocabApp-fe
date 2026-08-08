export interface AdminStatistics {
  totalQuestions: number
  totalTests: number
  totalUsers: number
  totalResults: number
  totalVocabularies: number
  questionsByLevel: Record<string, number>
  recentUsers: Array<{
    _id: string
    name: string
    email: string
    role: string
    createdAt?: string
  }>
}

export type SkillType = 'vocabulary' | 'grammar' | 'reading' | 'listening'
export type LevelType = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export type DifficultyType = 'easy' | 'medium' | 'hard'
export type StatusType = 'active' | 'draft' | 'inactive'

export interface QuestionOption {
  text: string
  isCorrect: boolean
}

export interface QuestionItem {
  _id: string
  level: LevelType
  topic: string
  type: string
  question: string
  options: QuestionOption[]
  explanation: string
  difficulty: DifficultyType
  skill: SkillType
  status: StatusType
  createdAt?: string
}

export interface QuestionPagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface QuestionsResponseData {
  questions: QuestionItem[]
  pagination: QuestionPagination
}

export interface QuestionQuery {
  level?: string
  skill?: string
  difficulty?: string
  status?: string
  q?: string
  page?: number
  limit?: number
}

export interface TestConfigPayload {
  name: string
  level: LevelType
  totalQuestions: number
  config: {
    vocabulary: number
    grammar: number
    reading: number
    listening: number
  }
  difficultyRatio: {
    easy: number
    medium: number
    hard: number
  }
  timeLimit: number
  passingScore: number
  status: StatusType
}

export interface TestItem extends TestConfigPayload {
  _id: string
  testId?: string
  createdAt?: string
}

export interface UserAdminItem {
  _id: string
  name: string
  email: string
  role: 'user' | 'admin'
  status?: 'active' | 'inactive' | 'locked'
  isVerified?: boolean
  createdAt?: string
}
