import type { StatusType } from './admin'

export type ExerciseType =
  | 'multiple_choice'
  | 'listening'
  | 'translation'
  | 'fill_blank'
  | 'sentence_arrangement'

export interface ExerciseContentPayload {
  question?: string
  audio_url?: string
  prompt?: string
  sentence?: string
  words?: string[]
  options?: string[]
}

export interface ExerciseAnswerPayload {
  correct_option_index?: number
  expected_answer?: string
  blank_answer?: string
  correct_sentence?: string
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
  answer?: ExerciseAnswerPayload
  options?: Array<{ text: string; isCorrect?: boolean }>
  explanation?: string
}
