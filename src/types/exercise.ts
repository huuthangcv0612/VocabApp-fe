import type { StatusType } from './admin'

export type ExerciseType =
  | 'multiple_choice'
  | 'listening'
  | 'translation'
  | 'fill_blank'
  | 'sentence_arrangement'
  | 'word_arrangement'
  | 'matching'

export interface MatchingPair {
  id: string
  left: string
  right: string
}

export interface MatchingContent {
  pairs: MatchingPair[]
}

export interface ExerciseContentPayload {
  question?: string
  audio_url?: string
  prompt?: string
  sentence?: string
  words?: string[]
  options?: string[]
  hint?: string
  sentence_translation?: string
  pairs?: MatchingPair[]
  [key: string]: unknown
}

export interface ExerciseAnswerPayload {
  correct_answer?: string | string[]
  correct_option_index?: number
  correct_option?: string
  value?: string
  expected_answer?: string
  blank_answer?: string
  correct_sentence?: string
  explanation?: string
  [key: string]: unknown
}

export interface LessonExercise {
  _id: string
  lesson_id?: string
  order: number
  type: ExerciseType | string
  vocabulary_id?: string | { _id: string; word: string; meaning?: string }
  vocabularyId?: string
  vocabularyName?: string
  xp: number
  status?: StatusType
  question: string
  content?: ExerciseContentPayload
  answer?: ExerciseAnswerPayload | Record<string, unknown>
  options?: Array<{ text: string; isCorrect?: boolean }>
  explanation?: string
  hint?: string
  sentence_translation?: string
  pairs?: MatchingPair[]

  // Normalized internal format fields for FE
  optionsList?: string[]
  wordTokens?: string[]
  correctAnswer?: string
  rawAnswerFormat?: 'text' | 'index' | 'array'
}
