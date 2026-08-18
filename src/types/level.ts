import type { StatusType } from './admin'

export interface LevelItem {
  _id: string
  level_name: string
  name?: string
  description?: string
  order: number
  status?: StatusType
  topicCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface LevelPayload {
  level_name: string
  description?: string
  order: number
  status?: StatusType
}
