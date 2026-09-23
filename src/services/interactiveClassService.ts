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
  SessionConnectedStudent,
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
    const cls = ((data?.class as Record<string, unknown>) || data || {}) as unknown as ClassItem
    const count =
      (typeof cls.students_count === 'number' ? cls.students_count : undefined) ??
      (typeof cls.studentCount === 'number' ? cls.studentCount : undefined) ??
      0
    return {
      ...cls,
      students_count: count,
      studentCount: count,
    }
  },

  getClasses: async (): Promise<ClassItem[]> => {
    const res = await api.get('/classes')
    const data = unpack<unknown>(res)
    let list: Record<string, unknown>[] = []
    if (Array.isArray(data)) list = data as Record<string, unknown>[]
    else {
      const record = data as Record<string, unknown>
      if (Array.isArray(record?.classes)) list = record.classes as Record<string, unknown>[]
      else if (Array.isArray(record?.data)) list = record.data as Record<string, unknown>[]
    }
    return list.map((item) => {
      const count =
        (typeof item.students_count === 'number' ? item.students_count : undefined) ??
        (typeof item.studentCount === 'number' ? item.studentCount : undefined) ??
        (Array.isArray(item.students) ? item.students.length : 0)
      return {
        ...(item as unknown as ClassItem),
        students_count: count,
        studentCount: count,
      }
    })
  },

  getClassById: async (id: string): Promise<ClassItem> => {
    const res = await api.get(`/classes/${encodeURIComponent(id)}`)
    const data = unpack<Record<string, unknown>>(res)
    const classObj = ((data?.class as Record<string, unknown>) || data || {}) as Record<string, unknown>
    const count =
      (typeof classObj.students_count === 'number' ? classObj.students_count : undefined) ??
      (typeof classObj.studentCount === 'number' ? classObj.studentCount : undefined) ??
      (typeof data?.students_count === 'number' ? (data.students_count as number) : undefined) ??
      (typeof data?.studentCount === 'number' ? (data.studentCount as number) : undefined) ??
      (Array.isArray(classObj.students) ? classObj.students.length : 0)

    const isTeacher =
      typeof data?.isTeacher === 'boolean'
        ? (data.isTeacher as boolean)
        : typeof classObj.isTeacher === 'boolean'
        ? (classObj.isTeacher as boolean)
        : undefined

    return {
      ...(classObj as unknown as ClassItem),
      students_count: count,
      studentCount: count,
      ...(isTeacher !== undefined ? { isTeacher } : {}),
    }
  },

  updateClass: async (id: string, payload: UpdateClassPayload): Promise<ClassItem> => {
    const res = await api.put(`/classes/${encodeURIComponent(id)}`, payload)
    const data = unpack<Record<string, unknown>>(res)
    const cls = ((data?.class as Record<string, unknown>) || data || {}) as unknown as ClassItem
    const count =
      (typeof cls.students_count === 'number' ? cls.students_count : undefined) ??
      (typeof cls.studentCount === 'number' ? cls.studentCount : undefined) ??
      0
    return {
      ...cls,
      students_count: count,
      studentCount: count,
    }
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
    let list: Record<string, unknown>[] = []
    if (Array.isArray(data)) list = data as Record<string, unknown>[]
    else {
      const record = data as Record<string, unknown>
      if (Array.isArray(record?.classes)) list = record.classes as Record<string, unknown>[]
      else if (Array.isArray(record?.data)) list = record.data as Record<string, unknown>[]
    }
    return list.map((item) => {
      const count =
        (typeof item.students_count === 'number' ? item.students_count : undefined) ??
        (typeof item.studentCount === 'number' ? item.studentCount : undefined) ??
        (Array.isArray(item.students) ? item.students.length : 0)
      return {
        ...(item as unknown as ClassItem),
        students_count: count,
        studentCount: count,
      }
    })
  },

  getClassStudents: async (classId: string): Promise<ClassStudent[]> => {
    const res = await api.get(`/classes/${encodeURIComponent(classId)}/students`)
    const data = unpack<unknown>(res)
    let list: Record<string, unknown>[] = []
    if (Array.isArray(data)) list = data as Record<string, unknown>[]
    else {
      const record = data as Record<string, unknown>
      if (Array.isArray(record?.students)) list = record.students as Record<string, unknown>[]
      else if (Array.isArray(record?.data)) list = record.data as Record<string, unknown>[]
    }
    return list.map((st, idx) => {
      const user = (st.user as Record<string, unknown>) || {}
      const id = String(
        st.id ??
        st._id ??
        st.student_id ??
        st.membership_id ??
        user.id ??
        user._id ??
        user.student_id ??
        ''
      ).trim()
      const studentId = String(
        st.student_id ??
        st._id ??
        st.id ??
        st.membership_id ??
        user.student_id ??
        user._id ??
        user.id ??
        id
      ).trim()
      const name = String(
        st.name ??
        user.name ??
        st.student_name ??
        user.student_name ??
        ''
      ).trim()
      const email = (st.email as string) || (user.email as string) || undefined
      const avatar = (st.avatar as string) || (user.avatar as string) || undefined
      const status = (st.status as string) || (user.status as string) || 'active'
      const joinedAt = (st.joined_at as string) || (st.created_at as string) || undefined
      const membershipId = (st.membership_id as string) || undefined

      return {
        ...(st as unknown as ClassStudent),
        _id: id || `student_${idx}`,
        id: id || `student_${idx}`,
        student_id: studentId || id || `student_${idx}`,
        membership_id: membershipId,
        name: name || 'Học viên',
        email,
        avatar,
        status,
        joined_at: joinedAt,
        user: typeof st.user === 'object' && st.user !== null ? (st.user as ClassStudent['user']) : undefined,
      }
    })
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
    const sessionObj = ((data?.session as Record<string, unknown>) || data || {}) as Record<string, unknown>
    return {
      ...(sessionObj as unknown as InteractiveSession),
      connected_students: (sessionObj.connected_students as SessionConnectedStudent[]) || [],
      connected_students_count:
        typeof sessionObj.connected_students_count === 'number'
          ? (sessionObj.connected_students_count as number)
          : 0,
    }
  },

  getSessionById: async (id: string): Promise<InteractiveSession> => {
    const res = await api.get(`/interactive-sessions/${encodeURIComponent(id)}`)
    const data = unpack<Record<string, unknown>>(res)
    const sessionObj = ((data?.session as Record<string, unknown>) || data || {}) as Record<string, unknown>
    const rawConnected =
      (sessionObj.connected_students as unknown[]) ??
      (data?.connected_students as unknown[]) ??
      []

    const connectedStudents: SessionConnectedStudent[] = []
    const seenIds = new Set<string>()

    if (Array.isArray(rawConnected)) {
      for (const raw of rawConnected) {
        if (!raw || typeof raw !== 'object') continue
        const item = raw as Record<string, unknown>
        const studentId = String(
          item.id ?? item._id ?? item.student_id ?? item.user_id ?? ''
        ).trim()
        if (!studentId || seenIds.has(studentId)) continue
        seenIds.add(studentId)
        connectedStudents.push({
          id: studentId,
          _id: studentId,
          student_id: (item.student_id as string) || studentId,
          user_id: (item.user_id as string) || studentId,
          name: String(item.name ?? item.student_name ?? 'Học viên').trim() || 'Học viên',
          avatar: (item.avatar as string) || undefined,
          score: typeof item.score === 'number' ? item.score : 0,
          joined_at: (item.joined_at as string) || undefined,
        })
      }
    }

    const connectedCount =
      (typeof sessionObj.connected_students_count === 'number'
        ? sessionObj.connected_students_count
        : undefined) ??
      (typeof data?.connected_students_count === 'number'
        ? (data.connected_students_count as number)
        : undefined) ??
      connectedStudents.length

    return {
      ...(sessionObj as unknown as InteractiveSession),
      connected_students: connectedStudents,
      connected_students_count: connectedCount,
    }
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
