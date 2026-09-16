import api from '../../../services/api'
import type {
  LearningPathData,
  LearningPathLevel,
  LearningPathUnit,
  LearningPathLesson,
  LessonStatus,
} from '../types/learningPath'

interface RawLevel {
  _id: string
  level_name: string
  name?: string
  description?: string
  order: number
}

interface RawTopic {
  _id: string
  topic_name?: string
  name?: string
}

interface RawLessonResponse {
  _id: string
  unit_id?: string | { _id: string }
  title?: string
  lektion_name?: string
  slug?: string
  description?: string
  order?: number
  status?: LessonStatus
  xp?: number
  estimated_minutes?: number
  progressPercentage?: number
}

interface RawUnitResponse {
  _id: string
  title?: string
  unit_name?: string
  slug?: string
  description?: string
  order?: number
  status?: string
  topic_id?: string | RawTopic
  lessons?: RawLessonResponse[]
  completedLessonsCount?: number
  totalLessonsCount?: number
  progressPercentage?: number
  totalXp?: number
}

export const extractLevelsFromResponse = (responseData: unknown): RawLevel[] => {
  if (!responseData) return []
  if (Array.isArray(responseData)) return responseData as RawLevel[]

  const resObj = responseData as Record<string, unknown>
  const dataObj = resObj.data || resObj

  if (Array.isArray(dataObj)) return dataObj as RawLevel[]

  if (dataObj && typeof dataObj === 'object') {
    const rec = dataObj as Record<string, unknown>
    if (Array.isArray(rec.levels)) return rec.levels as RawLevel[]
    if (Array.isArray(rec.data)) return rec.data as RawLevel[]
  }

  if (Array.isArray(resObj.levels)) return resObj.levels as RawLevel[]
  return []
}

export interface ExtractedUnitsResult {
  units: RawUnitResponse[]
  levelObj?: RawLevel & { completedLessonsCount?: number; totalLessonsCount?: number; progressPercentage?: number }
  completedLessonsCount?: number
  totalLessonsCount?: number
  progressPercentage?: number
}

export const extractUnitsFromResponse = (responseData: unknown): ExtractedUnitsResult => {
  if (!responseData) return { units: [] }

  if (Array.isArray(responseData)) {
    return { units: responseData as RawUnitResponse[] }
  }

  const resObj = responseData as Record<string, unknown>
  const dataObj = resObj.data || resObj

  let units: RawUnitResponse[] = []
  let levelObj: (RawLevel & { completedLessonsCount?: number; totalLessonsCount?: number; progressPercentage?: number }) | undefined = undefined
  let completedLessonsCount: number | undefined = undefined
  let totalLessonsCount: number | undefined = undefined
  let progressPercentage: number | undefined = undefined

  const parseRecord = (rec: Record<string, unknown>) => {
    if (Array.isArray(rec.units)) {
      units = rec.units as RawUnitResponse[]
    } else if (Array.isArray(rec.data)) {
      units = rec.data as RawUnitResponse[]
    }

    if (rec.level && typeof rec.level === 'object') {
      levelObj = rec.level as RawLevel
    }
    if (typeof rec.completedLessonsCount === 'number') completedLessonsCount = rec.completedLessonsCount
    if (typeof rec.totalLessonsCount === 'number') totalLessonsCount = rec.totalLessonsCount
    if (typeof rec.progressPercentage === 'number') progressPercentage = rec.progressPercentage
  }

  if (Array.isArray(dataObj)) {
    units = dataObj as RawUnitResponse[]
  } else if (dataObj && typeof dataObj === 'object') {
    parseRecord(dataObj as Record<string, unknown>)
  }

  if (units.length === 0) {
    parseRecord(resObj)
  }

  return { units, levelObj, completedLessonsCount, totalLessonsCount, progressPercentage }
}

export const learningPathService = {
  getLearningPathData: async (): Promise<LearningPathData> => {
    // 1. Fetch all levels dynamically from Backend
    const levelsRes = await api.get<unknown>('/levels').catch((err) => {
      console.error('[LearningPathService] GET /api/levels failed:', err)
      return null
    })

    const rawLevels = extractLevelsFromResponse(levelsRes?.data)
    rawLevels.sort((a, b) => (a.order || 0) - (b.order || 0))

    let currentLessonId: string | undefined = undefined

    // 2. Fetch units and lessons per level directly from GET /api/levels/:levelId/units (Backend Source of Truth)
    const formattedLevels: LearningPathLevel[] = await Promise.all(
      rawLevels.map(async (lvl) => {
        const lvlId = lvl._id
        const lvlName = lvl.level_name || lvl.name || 'Level'

        const unitsRes = await api
          .get<unknown>(`/levels/${encodeURIComponent(lvlId)}/units`)
          .catch((err) => {
            console.error(`[LearningPathService] GET /api/levels/${lvlId}/units failed:`, err)
            return null
          })

        const extracted = extractUnitsFromResponse(unitsRes?.data)
        const rawUnits = extracted.units
        const backendLevelObj = extracted.levelObj
        const topLevelCompletedCount = extracted.completedLessonsCount
        const topLevelTotalCount = extracted.totalLessonsCount
        const topLevelProgressPct = extracted.progressPercentage

        rawUnits.sort((a, b) => (a.order || 0) - (b.order || 0))

        let levelTotalLessons = 0
        let levelCompletedLessons = 0

        const formattedUnits: LearningPathUnit[] = rawUnits.map((u) => {
          const topicObj = typeof u.topic_id === 'object' ? u.topic_id : null
          const topicName = topicObj?.topic_name || topicObj?.name
          const rawLessons = u.lessons || []

          let unitCompletedCount = 0
          let unitTotalXp = 0

          const formattedLessons: LearningPathLesson[] = rawLessons.map((les, lesIdx) => {
            const status: LessonStatus =
              les.status === 'completed' || les.status === 'current' || les.status === 'locked'
                ? les.status
                : 'locked'

            if (status === 'completed') {
              unitCompletedCount++
            } else if (status === 'current' && !currentLessonId) {
              currentLessonId = les._id
            }

            const xp = les.xp || 20
            unitTotalXp += xp

            return {
              _id: les._id,
              unit_id: u._id,
              title: les.title || les.lektion_name || `Bài học ${lesIdx + 1}`,
              slug: les.slug,
              description: les.description || '',
              order: les.order || lesIdx + 1,
              status,
              estimated_minutes: les.estimated_minutes || 5,
              xp,
              progressPercentage: les.progressPercentage || (status === 'completed' ? 100 : 0),
              topicName,
            }
          })

          levelTotalLessons += formattedLessons.length
          levelCompletedLessons += unitCompletedCount

          const unitProgressPct = formattedLessons.length > 0
            ? Math.round((unitCompletedCount / formattedLessons.length) * 100)
            : 0

          return {
            _id: u._id,
            level_id: lvlId,
            topic_id: typeof u.topic_id === 'string' ? u.topic_id : topicObj?._id,
            topicName,
            title: u.title || u.unit_name || 'Unit',
            slug: u.slug,
            description: u.description || '',
            order: u.order || 1,
            status: u.status || 'published',
            lessons: formattedLessons,
            completedLessonsCount: u.completedLessonsCount ?? unitCompletedCount,
            totalLessonsCount: u.totalLessonsCount ?? formattedLessons.length,
            totalXp: u.totalXp ?? unitTotalXp,
            progressPercentage: u.progressPercentage ?? unitProgressPct,
          }
        })

        const levelCompletedLessonsCount = backendLevelObj?.completedLessonsCount ?? topLevelCompletedCount ?? levelCompletedLessons
        const levelTotalLessonsCount = backendLevelObj?.totalLessonsCount ?? topLevelTotalCount ?? levelTotalLessons
        const levelProgressPct = backendLevelObj?.progressPercentage ?? topLevelProgressPct ?? (levelTotalLessonsCount > 0 ? Math.round((levelCompletedLessonsCount / levelTotalLessonsCount) * 100) : 0)

        return {
          _id: lvlId,
          level_name: lvlName,
          description: lvl.description,
          order: lvl.order || 1,
          units: formattedUnits,
          completedLessonsCount: levelCompletedLessonsCount,
          totalLessonsCount: levelTotalLessonsCount,
          progressPercentage: levelProgressPct,
        }
      })
    )

    const initialLevelId = formattedLevels.length > 0 ? formattedLevels[0]._id : ''

    return {
      levels: formattedLevels,
      currentLevelId: initialLevelId,
      currentLessonId,
    }
  },
}
