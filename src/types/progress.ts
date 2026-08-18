export type LessonProgressStatus = 'not_started' | 'in_progress' | 'completed'

export type VocabularyMasteryState = 'new' | 'learning' | 'review' | 'mastered'

export interface LessonProgressItem {
  _id: string
  user: string
  lesson: string
  status: LessonProgressStatus
  progress: number // percentage 0 - 100
  score: number // total correct answers
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
