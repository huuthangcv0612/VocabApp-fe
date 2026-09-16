export type LessonStatus = 'completed' | 'current' | 'locked'

export interface LearningPathLesson {
  _id: string
  unit_id: string
  title: string
  slug?: string
  description?: string
  order: number
  status: LessonStatus
  estimated_minutes: number
  xp: number
  progressPercentage: number
  topicName?: string
}

export interface LearningPathUnit {
  _id: string
  level_id?: string
  topic_id?: string
  topicName?: string
  title: string
  slug?: string
  description?: string
  order: number
  status: string
  lessons: LearningPathLesson[]
  completedLessonsCount: number
  totalLessonsCount: number
  totalXp: number
  progressPercentage: number
}

export interface LearningPathLevel {
  _id: string
  level_name: string
  description?: string
  order: number
  units: LearningPathUnit[]
  completedLessonsCount: number
  totalLessonsCount: number
  progressPercentage: number
}

export interface LearningPathData {
  levels: LearningPathLevel[]
  currentLevelId: string
  currentLessonId?: string
}
