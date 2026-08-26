export type LessonProgressStatus = 'not_started' | 'in_progress' | 'completed'

export type VocabularyMasteryState = 'new' | 'learning' | 'review' | 'mastered'

export interface LessonProgressEntry {
  _id?: string
  user_id?: string
  lesson_id?: string | {
    _id: string
    title: string
    level_id?: string | {
      _id: string
      level_name: string
    }
  }
  lektionId?: string
  status: LessonProgressStatus
  progress: number
  xp_earned?: number
  learnedWordsCount?: number
  started_at?: string
  completed_at?: string
  updatedAt?: string
}

export interface UserProgressData {
  lessonProgresses?: LessonProgressEntry[]
  lektionProgresses?: LessonProgressEntry[]
  stats: {
    completedLessonsCount?: number
    completedLektionsCount?: number
    totalLearnedWordsCount: number
  }
}

export interface SingleLessonProgressData {
  lessonProgress: {
    user_id?: string
    lesson_id: string
    status: LessonProgressStatus
    progress: number
    xp_earned?: number
    started_at?: string
    completed_at?: string
  }
  exerciseProgresses?: Array<{
    _id?: string
    exercise_id: string
    lesson_id?: string
    is_correct: boolean
    attempts?: number
  }>
  nextLesson?: {
    _id: string
    title: string
    order?: number
    level_id?: string
  }
}

export interface LessonProgressItem {
  _id: string
  user: string
  lesson: string
  status: LessonProgressStatus
  progress: number
  score: number
  total_exercises: number
  completed_exercises: number
  xp_earned: number
  started_at?: string
  completed_at?: string
  createdAt?: string
  updatedAt?: string
}

export interface VocabularyProgressItem {
  _id: string
  user: string
  vocabulary: string
  mastery: VocabularyMasteryState
  times_seen: number
  times_answered: number
  times_correct: number
  times_wrong: number
  last_reviewed_at?: string
  createdAt?: string
  updatedAt?: string
}

export interface DashboardProgressOverview {
  todayLearnedCount: number
  todayXpEarned: number
  lessonsCompletedCount: number
  totalVocabularyCount: number
  totalLearnedVocabularyCount: number
  totalXp: number
  masteryBreakdown: {
    new: number
    learning: number
    review: number
    mastered: number
  }
}

