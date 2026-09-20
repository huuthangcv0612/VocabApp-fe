import { useState, useEffect, useCallback, useRef } from 'react'
import { progressService } from '../../../services/progressService'
import type { ProgressOverviewData } from '../types/progressOverview'

export interface UseProgressOverviewReturn {
  data: ProgressOverviewData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useProgressOverview = (): UseProgressOverviewReturn => {
  const [data, setData] = useState<ProgressOverviewData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const isMountedRef = useRef<boolean>(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const fetchData = useCallback(async () => {
    if (isMountedRef.current) {
      setLoading(true)
      setError(null)
    }

    try {
      const result = await progressService.getProgressOverview()
      if (isMountedRef.current) {
        setData(result)
        setError(null)
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error('Failed to fetch progress overview:', err)
        setError('Không thể tải tiến độ học tập.')
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}

export default useProgressOverview
