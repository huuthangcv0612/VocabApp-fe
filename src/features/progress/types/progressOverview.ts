export interface CurrentLevel {
  _id: string
  level_name: string
  order: number
}

export interface ProgressOverview {
  currentLevel: CurrentLevel
  levelCompletionPercentage: number
  lessonsCompleted: number
  totalLessons: number
  totalXp: number
  streak: number
  estimatedStudyMinutes: number
}

export interface ContinueLearning {
  lessonId: string
  lessonTitle: string
  unitId: string
  unitTitle: string
  topicId: string
  topicTitle: string
  levelId: string
  levelName: string
  progress: number
  status: 'in_progress' | 'not_started'
}

export interface ProgressLevel {
  _id: string
  level_name: string
  order: number
  totalLessons: number
  completedLessons: number
  completionPercentage: number
  isCurrent: boolean
}

export interface VocabularyProgress {
  learned: number
  mastered: number
  learning: number
  needReview: number
}

export interface ActivityEntry {
  date: string
  exercisesCount: number
  lessonsCompleted: number
}

export interface ExerciseTypePerformance {
  total: number
  correct: number
  accuracy: number
}

export interface ExercisePerformance {
  totalAttempted: number
  totalCorrect: number
  overallAccuracy: number
  byType: Record<string, ExerciseTypePerformance>
}

export interface ProgressOverviewData {
  overview: ProgressOverview
  continueLearning: ContinueLearning | null
  levels: ProgressLevel[]
  vocabulary: VocabularyProgress
  activity: ActivityEntry[]
  exercisePerformance: ExercisePerformance
}

export interface ProgressOverviewResponse {
  success: boolean
  statusCode: number
  message: string
  data: ProgressOverviewData
}
