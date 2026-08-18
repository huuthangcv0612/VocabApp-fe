import type { UnitItem } from './unit'
import type { TopicItem } from './topic'
import type { StatusType } from './admin'
import type { LessonExercise } from './exercise'

export interface LessonItem {
  _id: string
  title: string
  lektion_name?: string
  slug?: string
  description?: string
  order: number
  status?: StatusType
  estimated_minutes?: number
  xp?: number
  unit_id?: UnitItem | string
  unit?: UnitItem | string
  topic_id?: TopicItem | string
  topic?: TopicItem | string
  vocabularyCount?: number
  exerciseCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface LessonPreviewVocabulary {
  _id: string
  vocabularyId: string
  word: string
  meaning: string
  gender?: 'der' | 'die' | 'das' | string
  phonetic?: string
  order: number
  is_new?: boolean
  level?: string
  type?: string
}

export interface LessonDetailResponse {
  lesson: LessonItem
  preview?: {
    vocabularies: LessonPreviewVocabulary[]
  }
  vocabularies?: LessonPreviewVocabulary[]
  exercises?: LessonExercise[]
}

export interface LessonDetailData {
  lesson: LessonItem
  vocabularies: LessonPreviewVocabulary[]
  exercises: LessonExercise[]
}
