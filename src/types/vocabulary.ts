export interface VocabularyItem {
  _id: string
  word: string
  meaning: string
  pronunciation?: string
  phonetic?: string
  gender?: 'der' | 'die' | 'das' | string
  article?: 'der' | 'die' | 'das' | string
  plural?: string
  part_of_speech?: string
  type?: string
  example?: string
  translation?: string
  example_translation?: string
  audio_url?: string
  audio?: string
  image_url?: string
  image?: string
  level?: string
  difficultyLevel?: string
  tags?: string[]
  lektionId?: string
  lektion_id?: string
  createdAt?: string
  updatedAt?: string
}

export interface VocabularyPayload {
  word: string
  meaning: string
  pronunciation?: string
  part_of_speech?: string
  example?: string
  example_translation?: string
  audio_url?: string
  image_url?: string
  level?: string
  tags?: string[]
}
