export type AIConversationStatus = 'active' | 'completed'

export interface AILesson {
  _id: string
  title: string
  level: string
}

export interface AITargetVocabulary {
  _id: string
  word: string
  meaning: string
  part_of_speech: string
}

export type AIMessageRole = 'user' | 'assistant'

export interface AIMessage {
  role: AIMessageRole
  content: string
}

export interface AIFeedback {
  is_correct: boolean
  correction: string | null
  explanation: string | null
}

export interface ConversationTurn {
  id: string
  user_message?: AIMessage
  ai_message: AIMessage
  feedback?: AIFeedback
  used_vocabulary?: AITargetVocabulary[] | string[]
  createdAt?: string
}

export interface AIConversationSession {
  session_id: string
  lesson: AILesson
  target_vocabulary: AITargetVocabulary[]
  ai_message: AIMessage
  turn_count: number
  userTurnCount?: number
  isCompleted?: boolean
  scenario?: string
  status: AIConversationStatus
  messages?: ConversationTurn[]
  // Fields for completion summary from backend
  score?: number
  used_vocabulary?: AITargetVocabulary[] | string[]
  mistakes?: Array<{
    user_message?: string
    correction?: string
    explanation?: string
  }>
  total_turns?: number
  feedback_summary?: string
}

export interface StartConversationRequest {
  lessonId: string
  lesson_id?: string
}

export interface StartConversationResponseData {
  session_id: string
  lesson: AILesson
  target_vocabulary: AITargetVocabulary[]
  ai_message: AIMessage
  turn_count: number
  userTurnCount?: number
  isCompleted?: boolean
  scenario?: string
  status: AIConversationStatus
}

export interface SendMessageRequest {
  message: string
}

export interface SendMessageResponseData {
  session_id?: string
  user_message?: AIMessage
  ai_message: AIMessage
  feedback?: AIFeedback
  used_vocabulary?: AITargetVocabulary[] | string[]
  turn_count?: number
  userTurnCount?: number
  isCompleted?: boolean
  scenario?: string
  status?: AIConversationStatus
}

export type CompleteConversationResponseData = Record<string, unknown>

export type GetConversationResponseData = Record<string, unknown>

