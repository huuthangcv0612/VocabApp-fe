import { vocabularyApi } from './vocabularyApi'

export const vocabularyService = {
  getVocabularyList: async () => {
    const result = await vocabularyApi.getAll()
    return result.vocabularies
  },
}
