import type {
  VocabularyItem,
  VocabularySource,
  InteractiveVocabulary,
  TeacherVocabularyItem,
  CreateTeacherVocabularyPayload,
} from './vocabulary'

export type {
  VocabularySource,
  InteractiveVocabulary,
  TeacherVocabularyItem,
  CreateTeacherVocabularyPayload,
}

export type ActivityType = 'flashcard' | 'quiz' | 'spin'

export interface FlashcardConfig {
  show_translation: boolean
  show_example: boolean
  shuffle: boolean
}

export interface QuizConfig {
  question_count: number
  time_limit: number
  shuffle: boolean
}

export interface SpinConfig {
  spin_mode: 'word' | 'student' | string
  allow_repeat: boolean
}

export type ActivityConfig = FlashcardConfig | QuizConfig | SpinConfig

export interface InteractiveActivity {
  _id: string
  id?: string
  interactive_lesson_id?: string
  lesson_id: string
  lessonId?: string
  type: ActivityType
  title?: string
  config: ActivityConfig
  order?: number
  created_at?: string
  updated_at?: string
  createdAt?: string
  updatedAt?: string
}

export interface InteractiveLesson {
  _id: string
  id?: string
  class_id: string
  classId?: string
  teacher_id?: string
  teacherId?: string
  title: string
  description?: string
  level_id?: string
  level?: string
  vocabulary_ids?: string[]
  teacher_vocabulary_ids?: string[]
  vocabularies?: Array<string | VocabularyItem>
  vocabulary_count?: number
  activities?: InteractiveActivity[]
  activity_count?: number
  status: 'draft' | 'published'
  published?: boolean
  language: 'vi' | 'en'
  created_at?: string
  updated_at?: string
  createdAt?: string
  updatedAt?: string
}

export interface ClassStudent {
  _id: string
  id?: string
  student_id?: string
  user_id?: string
  membership_id?: string
  name: string
  email?: string
  avatar?: string
  status?: 'active' | 'inactive' | 'pending' | string
  joined_at?: string
  user?: {
    _id?: string
    id?: string
    name?: string
    email?: string
    avatar?: string
    [key: string]: unknown
  }
}

export interface ClassItem {
  _id: string
  id?: string
  name: string
  description?: string
  class_code: string
  code?: string
  teacher_id?: string | { _id: string; name: string; email?: string }
  teacher_name?: string
  students?: ClassStudent[]
  students_count?: number
  studentCount?: number
  isTeacher?: boolean
  status?: 'active' | 'archived' | string
  active_session_id?: string | null
  created_at?: string
  updated_at?: string
}

export interface SessionConnectedStudent {
  id: string
  _id?: string
  student_id?: string
  user_id?: string
  name: string
  avatar?: string
  score?: number
  joined_at?: string
}

export interface SessionResponseRecord {
  student_id: string
  student_name?: string
  answer: string | number | boolean | Record<string, unknown>
  is_correct?: boolean
  created_at?: string
}

export interface InteractiveSession {
  _id: string
  id?: string
  interactive_lesson_id?: string
  lesson_id: string
  lessonId?: string
  class_id: string
  classId?: string
  class_info?: Partial<ClassItem>
  lesson_info?: Partial<InteractiveLesson>
  status: 'waiting' | 'active' | 'in_progress' | 'ended' | string
  current_activity_id?: string | null
  current_activity_type?: ActivityType | null
  current_item_index?: number
  current_item?: VocabularyItem | Record<string, unknown> | null
  show_answer?: boolean
  connected_students?: SessionConnectedStudent[]
  connected_students_count?: number
  students_count?: number
  studentCount?: number
  spin_result?: {
    word?: string
    vocabulary?: VocabularyItem
    student_id?: string
    student_name?: string
    [key: string]: unknown
  } | VocabularyItem | string | null
  responses?: SessionResponseRecord[]
  created_at?: string
  ended_at?: string
}

export interface CreateClassPayload {
  name: string
  description?: string
}

export interface UpdateClassPayload {
  name?: string
  description?: string
  status?: string
}

export interface JoinClassPayload {
  class_code?: string
  code?: string
}

export interface ActivityPayloadItem {
  _id?: string
  id?: string
  type: ActivityType
  title?: string
  order?: number
  config: ActivityConfig
}

export interface CreateLessonPayload {
  class_id: string
  classId?: string
  title: string
  description?: string
  level?: string
  level_id?: string
  vocabularies?: string[]
  vocabulary_ids?: string[]
  teacher_vocabulary_ids?: string[]
  status?: 'draft' | 'published'
  published?: boolean
  language?: 'vi' | 'en'
  activities?: ActivityPayloadItem[]
}

export interface UpdateLessonPayload {
  title?: string
  description?: string
  level?: string
  level_id?: string
  vocabularies?: string[]
  vocabulary_ids?: string[]
  teacher_vocabulary_ids?: string[]
  status?: 'draft' | 'published'
  published?: boolean
  language?: 'vi' | 'en'
  activities?: ActivityPayloadItem[]
}

export interface CreateActivityPayload {
  lesson_id: string
  type: ActivityType
  title?: string
  config: ActivityConfig
  order?: number
}

export interface UpdateActivityPayload {
  title?: string
  config?: Partial<ActivityConfig>
  order?: number
}

export interface CreateSessionPayload {
  class_id: string
  lesson_id: string
}

export interface SessionResponsePayload {
  answer: string | number | boolean | Record<string, unknown>
  question_id?: string
  time_spent?: number
}
