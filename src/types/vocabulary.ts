export type VocabularySource = 'system' | 'teacher'

export interface VocabularyItem {
  _id: string
  id?: string
  word: string
  meaning: string
  pronunciation?: string
  phonetic?: string
  gender?: 'der' | 'die' | 'das' | string
  article?: 'der' | 'die' | 'das' | string
  plural?: string
  part_of_speech?: string
  partOfSpeech?: string
  type?: string
  example?: string
  translation?: string
  example_translation?: string
  exampleMeaning?: string
  audio_url?: string
  audioUrl?: string
  audio?: string
  image_url?: string
  imageUrl?: string
  image?: string
  level?: string
  difficultyLevel?: string
  tags?: string[]
  lektionId?: string
  lektion_id?: string
  teacher_id?: string
  source?: VocabularySource
  createdAt?: string
  updatedAt?: string
}

export type InteractiveVocabulary = VocabularyItem

export interface VocabularyPayload {
  word: string
  meaning: string
  pronunciation?: string
  part_of_speech?: string
  partOfSpeech?: string
  article?: string
  plural?: string
  example?: string
  example_translation?: string
  exampleMeaning?: string
  audio_url?: string
  audioUrl?: string
  image_url?: string
  imageUrl?: string
  level?: string
  tags?: string[]
}

export interface CreateTeacherVocabularyPayload {
  word: string
  meaning: string
  partOfSpeech?: string
  part_of_speech?: string
  article?: string
  plural?: string
  example?: string
  exampleMeaning?: string
  example_translation?: string
  pronunciation?: string
  level?: string
  audioUrl?: string
  imageUrl?: string
}

export interface TeacherVocabularyItem extends VocabularyItem {
  source: 'teacher'
  teacher_id?: string
}
