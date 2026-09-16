import { useState, useEffect, useCallback, useMemo } from 'react'
import { learningPathService } from '../services/learningPath.service'
import type { LearningPathData, LearningPathLevel } from '../types/learningPath'

export const useLearningPath = () => {
  const [data, setData] = useState<LearningPathData | null>(null)
  const [selectedLevelId, setSelectedLevelId] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const resData = await learningPathService.getLearningPathData()
      setData(resData)
      if (resData.levels.length > 0) {
        // Default to first level or level with current lesson
        let defaultLvl = resData.levels[0]._id
        if (resData.currentLessonId) {
          const matchingLvl = resData.levels.find((l) =>
            l.units.some((u) => u.lessons.some((les) => les._id === resData.currentLessonId))
          )
          if (matchingLvl) {
            defaultLvl = matchingLvl._id
          }
        }
        setSelectedLevelId((prev) => (prev ? prev : defaultLvl))
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể tải dữ liệu Learning Path.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const activeLevel = useMemo<LearningPathLevel | null>(() => {
    if (!data || !data.levels.length) return null
    return data.levels.find((l) => l._id === selectedLevelId) || data.levels[0]
  }, [data, selectedLevelId])

  return {
    data,
    activeLevel,
    selectedLevelId,
    setSelectedLevelId,
    loading,
    error,
    refetch: fetchData,
  }
}
