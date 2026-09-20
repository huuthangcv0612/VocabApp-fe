import api from './api'
import type { ApiResponse } from '../types/api'
import type {
  ClassItem,
  ClassStudent,
  CreateClassPayload,
  UpdateClassPayload,
  JoinClassPayload,
  InteractiveLesson,
  CreateLessonPayload,
  UpdateLessonPayload,
  InteractiveActivity,
  CreateActivityPayload,
  UpdateActivityPayload,
  InteractiveSession,
  CreateSessionPayload,
  SessionResponsePayload,
} from '../types/interactiveClass'
import type { VocabularyItem, VocabularyPayload } from '../types/vocabulary'

// Helper to safely unpack diverse API responses
const unpack = <T>(res: { data: ApiResponse<T> | T }): T => {
  const d = res.data as Record<string, unknown>
  if (d && typeof d === 'object' && 'data' in d && d.data !== undefined) {
    return d.data as T
  }
  return res.data as T
}

export const interactiveClassService = {
  // ==========================================
  // CLASSES
  // ==========================================

  createClass: async (payload: CreateClassPayload): Promise<ClassItem> => {
    const res = await api.post('/classes', payload)
    const data = unpack<Record<string, unknown>>(res)
    return (data?.class as ClassItem) || (data as unknown as ClassItem)
  },

  getClasses: async (): Promise<ClassItem[]> => {
    const res = await api.get('/classes')
    const data = unpack<unknown>(res)
    if (Array.isArray(data)) return data as ClassItem[]
    const record = data as Record<string, unknown>
    if (Array.isArray(record?.classes)) return record.classes as ClassItem[]
    return []
  },

  getClassById: async (id: string): Promise<ClassItem> => {
    const res = await api.get(`/classes/${encodeURIComponent(id)}`)
    const data = unpack<Record<string, unknown>>(res)
    return (data?.class as ClassItem) || (data as unknown as ClassItem)
  },

  updateClass: async (id: string, payload: UpdateClassPayload): Promise<ClassItem> => {
    const res = await api.put(`/classes/${encodeURIComponent(id)}`, payload)
    const data = unpack<Record<string, unknown>>(res)
    return (data?.class as ClassItem) || (data as unknown as ClassItem)
  },

  deleteClass: async (id: string): Promise<void> => {
    await api.delete(`/classes/${encodeURIComponent(id)}`)
  },

  joinClass: async (payload: JoinClassPayload): Promise<{ class?: ClassItem; message?: string }> => {
    const code = (payload.class_code || payload.code || '').trim()
    const res = await api.post('/classes/join', {
      class_code: code,
      code,
    })
    const data = unpack<Record<string, unknown>>(res)
    return {
      class: (data?.class as ClassItem) || (data?._id ? (data as unknown as ClassItem) : undefined),
      message: data?.message as string | undefined,
    }
  },

  getMyClasses: async (): Promise<ClassItem[]> => {
    const res = await api.get('/classes/my')
    const data = unpack<unknown>(res)
    if (Array.isArray(data)) return data as ClassItem[]
    const record = data as Record<string, unknown>
    if (Array.isArray(record?.classes)) return record.classes as ClassItem[]
    return []
  },

  getClassStudents: async (classId: string): Promise<ClassStudent[]> => {
    const res = await api.get(`/classes/${encodeURIComponent(classId)}/students`)
    const data = unpack<unknown>(res)
    if (Array.isArray(data)) return data as ClassStudent[]
    const record = data as Record<string, unknown>
    if (Array.isArray(record?.students)) return record.students as ClassStudent[]
    return []
  },

  removeStudent: async (classId: string, studentId: string): Promise<void> => {
    await api.delete(
      `/classes/${encodeURIComponent(classId)}/students/${encodeURIComponent(studentId)}`,
    )
  },

  // ==========================================
  // INTERACTIVE LESSONS
  // ==========================================

  createLesson: async (payload: CreateLessonPayload): Promise<InteractiveLesson> => {
    const res = await api.post('/interactive-lessons', payload)
    const data = unpack<Record<string, unknown>>(res)
    return (data?.lesson as InteractiveLesson) || (data as unknown as InteractiveLesson)
  },

  getLessons: async (classId: string): Promise<InteractiveLesson[]> => {
    const res = await api.get(
      `/interactive-lessons?class_id=${encodeURIComponent(classId)}`,
    )
    const data = unpack<unknown>(res)
    if (Array.isArray(data)) return data as InteractiveLesson[]
    const record = data as Record<string, unknown>
    if (Array.isArray(record?.lessons)) return record.lessons as InteractiveLesson[]
    return []
  },

  getLessonById: async (id: string): Promise<InteractiveLesson> => {
    const res = await api.get(`/interactive-lessons/${encodeURIComponent(id)}`)
    const data = unpack<Record<string, unknown>>(res)
    return (data?.lesson as InteractiveLesson) || (data as unknown as InteractiveLesson)
  },

  updateLesson: async (
    id: string,
    payload: UpdateLessonPayload,
  ): Promise<InteractiveLesson> => {
    const res = await api.put(
      `/interactive-lessons/${encodeURIComponent(id)}`,
      payload,
    )
    const data = unpack<Record<string, unknown>>(res)
    return (data?.lesson as InteractiveLesson) || (data as unknown as InteractiveLesson)
  },

  deleteLesson: async (id: string): Promise<void> => {
    await api.delete(`/interactive-lessons/${encodeURIComponent(id)}`)
  },

  // ==========================================
  // INTERACTIVE ACTIVITIES
  // ==========================================

  createActivity: async (
    payload: CreateActivityPayload,
  ): Promise<InteractiveActivity> => {
    const res = await api.post('/interactive-activities', payload)
    const data = unpack<Record<string, unknown>>(res)
    return (data?.activity as InteractiveActivity) || (data as unknown as InteractiveActivity)
  },

  getActivities: async (lessonId: string): Promise<InteractiveActivity[]> => {
    const res = await api.get(
      `/interactive-activities?lesson_id=${encodeURIComponent(lessonId)}`,
    )
    const data = unpack<unknown>(res)
    if (Array.isArray(data)) return data as InteractiveActivity[]
    const record = data as Record<string, unknown>
    if (Array.isArray(record?.activities)) return record.activities as InteractiveActivity[]
    return []
  },

  getActivityById: async (id: string): Promise<InteractiveActivity> => {
    const res = await api.get(`/interactive-activities/${encodeURIComponent(id)}`)
    const data = unpack<Record<string, unknown>>(res)
    return (data?.activity as InteractiveActivity) || (data as unknown as InteractiveActivity)
  },

  updateActivity: async (
    id: string,
    payload: UpdateActivityPayload,
  ): Promise<InteractiveActivity> => {
    const res = await api.put(
      `/interactive-activities/${encodeURIComponent(id)}`,
      payload,
    )
    const data = unpack<Record<string, unknown>>(res)
    return (data?.activity as InteractiveActivity) || (data as unknown as InteractiveActivity)
  },

  deleteActivity: async (id: string): Promise<void> => {
    await api.delete(`/interactive-activities/${encodeURIComponent(id)}`)
  },

  // ==========================================
  // INTERACTIVE SESSIONS
  // ==========================================

  createSession: async (
    payload: CreateSessionPayload,
  ): Promise<InteractiveSession> => {
    const res = await api.post('/interactive-sessions', payload)
    const data = unpack<Record<string, unknown>>(res)
    return (data?.session as InteractiveSession) || (data as unknown as InteractiveSession)
  },

  getSessionById: async (id: string): Promise<InteractiveSession> => {
    const res = await api.get(`/interactive-sessions/${encodeURIComponent(id)}`)
    const data = unpack<Record<string, unknown>>(res)
    return (data?.session as InteractiveSession) || (data as unknown as InteractiveSession)
  },

  setSessionActivity: async (
    sessionId: string,
    activityId: string,
  ): Promise<InteractiveSession> => {
    const res = await api.put(
      `/interactive-sessions/${encodeURIComponent(sessionId)}/activity`,
      { activity_id: activityId },
    )
    const data = unpack<Record<string, unknown>>(res)
    return (data?.session as InteractiveSession) || (data as unknown as InteractiveSession)
  },

  nextSessionItem: async (sessionId: string): Promise<InteractiveSession> => {
    const res = await api.put(
      `/interactive-sessions/${encodeURIComponent(sessionId)}/next`,
    )
    const data = unpack<Record<string, unknown>>(res)
    return (data?.session as InteractiveSession) || (data as unknown as InteractiveSession)
  },

  spinSession: async (
    sessionId: string,
  ): Promise<{ spin_result: unknown; session?: InteractiveSession }> => {
    const res = await api.post(
      `/interactive-sessions/${encodeURIComponent(sessionId)}/spin`,
    )
    const data = unpack<Record<string, unknown>>(res)
    return {
      spin_result: data?.spin_result || data?.result || data,
      session: data?.session as InteractiveSession | undefined,
    }
  },

  submitResponse: async (
    sessionId: string,
    payload: SessionResponsePayload,
  ): Promise<unknown> => {
    const res = await api.post(
      `/interactive-sessions/${encodeURIComponent(sessionId)}/response`,
      payload,
    )
    return unpack<unknown>(res)
  },

  endSession: async (sessionId: string): Promise<InteractiveSession> => {
    const res = await api.put(
      `/interactive-sessions/${encodeURIComponent(sessionId)}/end`,
    )
    const data = unpack<Record<string, unknown>>(res)
    return (data?.session as InteractiveSession) || (data as unknown as InteractiveSession)
  },

  // ==========================================
  // VOCABULARY SEARCH & CREATION
  // ==========================================

  searchVocabulary: async (q: string): Promise<VocabularyItem[]> => {
    const trimmed = q.trim()
    if (!trimmed) return []
    try {
      const res = await api.get(
        `/vocabularies/search?q=${encodeURIComponent(trimmed)}`,
      )
      const data = unpack<unknown>(res)
      if (Array.isArray(data)) return data as VocabularyItem[]
      const record = data as Record<string, unknown>
      if (Array.isArray(record?.vocabularies)) return record.vocabularies as VocabularyItem[]
      if (Array.isArray(record?.data)) return record.data as VocabularyItem[]
      return []
    } catch {
      // Fallback to /vocabularies?search=...
      try {
        const fallbackRes = await api.get(
          `/vocabularies?search=${encodeURIComponent(trimmed)}&limit=20`,
        )
        const fbData = unpack<unknown>(fallbackRes)
        if (Array.isArray(fbData)) return fbData as VocabularyItem[]
        const fbRecord = fbData as Record<string, unknown>
        if (Array.isArray(fbRecord?.vocabularies)) return fbRecord.vocabularies as VocabularyItem[]
        return []
      } catch {
        return []
      }
    }
  },

  createVocabulary: async (
    payload: VocabularyPayload & { article?: string; gender?: string },
  ): Promise<VocabularyItem> => {
    const res = await api.post('/vocabularies', payload)
    const data = unpack<Record<string, unknown>>(res)
    return (data?.vocabulary as VocabularyItem) || (data as unknown as VocabularyItem)
  },
}
