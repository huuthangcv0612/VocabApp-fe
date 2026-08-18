import type { TopicItem } from './topic'
import type { LevelItem } from './level'
import type { StatusType } from './admin'

export interface UnitItem {
  _id: string
  name: string
  unit_name?: string
  unit_number?: number
  slug?: string
  description?: string
  order: number
  status?: StatusType
  topic_id?: TopicItem | string
  topic?: TopicItem | string
  level_id?: LevelItem | string
  vocabularyCount?: number
  lessonCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface UnitPayload {
  name: string
  unit_number?: number
  slug?: string
  description?: string
  order: number
  status?: StatusType
  topic_id: string | TopicItem
}
