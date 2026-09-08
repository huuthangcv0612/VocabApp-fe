import { useState, useEffect, useCallback } from 'react'
import {
  levelsApi,
  topicsApi,
  vocabularyApi,
  progressApi,
  Level,
  Topic,
  Lektion,
  LektionWithProgress,
  Vocabulary,
  ProgressOverview,
} from '../services/api'
import { lessonApi } from '../services/lessonApi'
import { unitApi } from '../services/unitApi'

export const useLevels = () => {
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLevels = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Fetching levels from:', import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL)
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

export const useTopics = (levelId?: string) => {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTopics = useCallback(async (id?: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await topicsApi.getAll({ levelId: id })
      setTopics(data as unknown as Topic[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch topics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTopics(levelId)
  }, [levelId, fetchTopics])

  return {
    topics,
    loading,
    error,
    refetch: () => fetchTopics(levelId),
  }
}

export const useUnits = (topicId?: string) => {
  const [units, setUnits] = useState<Array<{ _id: string; unit_name?: string; name?: string; description?: string; order?: number }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUnits = useCallback(async (id?: string) => {
    if (!id) {
      setUnits([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await unitApi.getAll({ topicId: id })
      setUnits(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch units')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUnits(topicId)
  }, [topicId, fetchUnits])

  return {
    units,
    loading,
    error,
    refetch: () => fetchUnits(topicId),
  }
}

export const useTopicLektions = (topicId?: string, levelId?: string) => {
  const [lektions, setLektions] = useState<LektionWithProgress[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLektions = useCallback(async (tId?: string, lId?: string) => {
    if (!tId) {
      setLektions([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await topicsApi.getLektionsByTopic(tId, lId)
      setLektions(data as unknown as LektionWithProgress[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch lektions for topic')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLektions(topicId, levelId)
  }, [topicId, levelId, fetchLektions])

  return {
    lektions,
    loading,
    error,
    refetch: () => fetchLektions(topicId, levelId),
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
      const data = id ? await lessonApi.getByLevel(id) : await lessonApi.getAll()
      const formatted = data.map((item) => ({
        _id: item._id,
        lektion_name: item.title || item.lektion_name || '',
        description: item.description,
        order: item.order,
        level_id: typeof item.level_id === 'object' ? item.level_id : (item.level_id || id),
        topic: typeof item.topic_id === 'object' && item.topic_id !== null ? (item.topic_id.name || item.topic_id.topic_name) : (typeof item.topic_id === 'string' ? item.topic_id : undefined),
        vocabularyCount: item.vocabularyCount,
      })) as unknown as Lektion[]
      setLektions(formatted)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch lessons')
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
      const list = Array.isArray(data) ? data : (data as unknown as { vocabularies: Vocabulary[] })?.vocabularies || []
      setVocabulary(list as unknown as Vocabulary[])
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
      setResults(data as unknown as Vocabulary[])
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

export const useProgressOverview = () => {
  const [overview, setOverview] = useState<ProgressOverview | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOverview = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await progressApi.getOverview()
      setOverview(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch progress overview')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOverview()
  }, [fetchOverview])

  return {
    overview,
    loading,
    error,
    refetch: fetchOverview,
  }
}