export interface ExerciseSubmitPayload {
  lessonId: string
  exerciseId: string
  userAnswer: string | number | string[]
}

export interface ExerciseSubmitResponse {
  correct: boolean
  feedback: string
  xp: number
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
