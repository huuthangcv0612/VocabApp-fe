export interface ExerciseSubmitPayload {
  lessonId: string
  exerciseId: string
  answer: string | number | string[]
}

export interface ExerciseSubmitResponse {
  is_correct: boolean
  xp_earned: number
  explanation: string
  correct?: boolean
  feedback?: string
  xp?: number
  correctAnswer?: string
}

export interface UnitLearningData {
  unitId: string
  unitName: string
  topicName?: string
  levelName?: string
  description?: string
  lessons: Array<{
    _id: string
    title: string
    description?: string
    status: 'completed' | 'available' | 'locked'
    estimated_minutes?: number
    xp?: number
  }>
}

export type LessonLearningStep = 'intro' | 'vocab_preview' | 'exercise' | 'complete'
