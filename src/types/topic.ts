import type { LevelItem } from './level'
import type { StatusType } from './admin'

export interface TopicItem {
  _id: string
  name: string
  topic_name?: string
  displayName?: string
  slug?: string
  description?: string
  order: number
  status?: StatusType
  level_id?: LevelItem | string
  level?: LevelItem | string
  unitCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface TopicPayload {
  name: string
  slug?: string
  description?: string
  order: number
  status?: StatusType
  level_id?: string | LevelItem
}
