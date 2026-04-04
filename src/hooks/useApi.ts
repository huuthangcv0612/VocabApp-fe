import { useState, useEffect } from 'react'
import { levelsApi, lektionsApi, vocabularyApi, Level, Lektion, Vocabulary } from '../services/api'

export const useLevels = () => {
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLevels = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Fetching levels from:', import.meta.env.VITE_API_BASE_URL)
      const data = await levelsApi.getAll()
      console.log('Levels data:', data)
      setLevels(data)
    } catch (err) {
      console.error('Error fetching levels:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch levels'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLevels()
  }, [])

  return {
    levels,
    loading,
    error,
    refetch: fetchLevels,
  }
}

export const useLektions = (levelId?: string) => {
  const [lektions, setLektions] = useState<Lektion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLektions = async (id?: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = id ? await lektionsApi.getByLevelId(id) : await lektionsApi.getAll()
      setLektions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch lektions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLektions(levelId)
  }, [levelId])

  return {
    lektions,
    loading,
    error,
    refetch: () => fetchLektions(levelId),
  }
}

export const useVocabulary = (lektionId?: string) => {
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchVocabulary = async (id?: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = id ? await vocabularyApi.getByLektionId(id) : await vocabularyApi.getAll()
      setVocabulary(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vocabulary')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (lektionId) {
      fetchVocabulary(lektionId)
    }
  }, [lektionId])

  return {
    vocabulary,
    loading,
    error,
    refetch: () => fetchVocabulary(lektionId),
  }
}

export const useVocabularySearch = () => {
  const [results, setResults] = useState<Vocabulary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async (keyword: string) => {
    if (!keyword.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await vocabularyApi.search(keyword)
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search vocabulary')
    } finally {
      setLoading(false)
    }
  }

  return {
    results,
    loading,
    error,
    search,
  }
}