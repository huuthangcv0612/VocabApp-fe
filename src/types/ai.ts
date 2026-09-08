export interface EvaluateSentencePayload {
  sentence: string
  vocabulary?: string
  context?: string
}

export interface EvaluateSentenceResponse {
  score?: number
  is_correct?: boolean
  feedback?: string
  explanation?: string
  suggestions?: string[]
}

export interface CheckGermanSentencePayload {
  sentence: string
}

export interface CheckGermanSentenceResponse {
  correct: boolean
  corrected: string
  errors: string[]
  explanation?: string
}

export interface GenerateQuestionPayload {
  vocabulary: string
  level: string
}

export interface GenerateQuestionResponse {
  question: string
  options: string[]
  correct_option_index: number
  explanation?: string
}

export interface AnalyzeErrorsPayload {
  sentences: string[]
  vocabulary?: string[]
}

export interface AnalyzeErrorsResponse {
  summary: string
  error_patterns: Array<{
    pattern: string
    frequency: number
    advice: string
  }>
}
