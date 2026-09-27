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
import type {
  VocabularyItem,
  InteractiveVocabulary,
  CreateTeacherVocabularyPayload,
} from '../types/vocabulary'

// Helper to safely unpack diverse API responses
const unpack = <T>(res: { data: ApiResponse<T> | T }): T => {
  const d = res.data as Record<string, unknown>
  if (d && typeof d === 'object' && 'data' in d && d.data !== undefined) {
    return d.data as T
  }
  return res.data as T
}

const normalizeLessonVocabs = (list: unknown[]): Array<string | VocabularyItem> => {
  return list.map((item, idx) => {
    if (typeof item === 'object' && item !== null) {
      const v = item as Record<string, unknown>
      const id = String(v._id || v.id || `v_${idx}`)
      return {
        ...v,
        _id: id,
        id,
        word: String(v.word || ''),
        meaning: String(v.meaning || ''),
        source: (v.source as 'system' | 'teacher') || 'system',
      } as unknown as VocabularyItem
    }
    return item as string
  })
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
    const rawLesson = ((data?.lesson as Record<string, unknown>) || data || {}) as Record<string, unknown>
    const acts =
      (Array.isArray(rawLesson.activities) ? rawLesson.activities : undefined) ??
      (Array.isArray(data?.activities) ? data.activities : undefined) ??
      []
    const vocabs = normalizeLessonVocabs(
      (Array.isArray(rawLesson.vocabularies) ? rawLesson.vocabularies : undefined) ??
      (Array.isArray(data?.vocabularies) ? data.vocabularies : undefined) ??
      []
    )
    return {
      ...(rawLesson as unknown as InteractiveLesson),
      activities: acts as InteractiveActivity[],
      vocabularies: vocabs,
      vocabulary_count:
        (typeof rawLesson.vocabulary_count === 'number' ? rawLesson.vocabulary_count : undefined) ??
        vocabs.length,
      activity_count:
        (typeof rawLesson.activity_count === 'number' ? rawLesson.activity_count : undefined) ??
        acts.length,
      language: (rawLesson.language as 'vi' | 'en') || (data?.language as 'vi' | 'en') || payload.language || 'vi',
    }
  },

  getLessons: async (classId: string): Promise<InteractiveLesson[]> => {
    const res = await api.get(
      `/interactive-lessons?class_id=${encodeURIComponent(classId)}`,
    )
    const data = unpack<unknown>(res)
    let list: Record<string, unknown>[] = []
    if (Array.isArray(data)) list = data as Record<string, unknown>[]
    else {
      const record = data as Record<string, unknown>
      if (Array.isArray(record?.lessons)) list = record.lessons as Record<string, unknown>[]
      else if (Array.isArray(record?.data)) list = record.data as Record<string, unknown>[]
    }
    return list.map((item) => {
      const vocabs = normalizeLessonVocabs(Array.isArray(item.vocabularies) ? (item.vocabularies as Array<unknown>) : [])
      const acts = Array.isArray(item.activities) ? (item.activities as InteractiveActivity[]) : []
      const vocabCount =
        (typeof item.vocabulary_count === 'number' ? item.vocabulary_count : undefined) ??
        vocabs.length
      const actCount =
        (typeof item.activity_count === 'number' ? item.activity_count : undefined) ??
        acts.length
      const id = String(item._id || item.id || '')
      return {
        ...(item as unknown as InteractiveLesson),
        _id: id,
        id,
        vocabularies: vocabs,
        activities: acts,
        vocabulary_count: vocabCount,
        activity_count: actCount,
        status: (item.status as 'draft' | 'published') || (item.published ? 'published' : 'draft'),
        language: (item.language as 'vi' | 'en') || 'vi',
      }
    })
  },

  getLessonById: async (id: string): Promise<InteractiveLesson> => {
    const res = await api.get(`/interactive-lessons/${encodeURIComponent(id)}`)
    const data = unpack<Record<string, unknown>>(res)
    const rawLesson = ((data?.lesson as Record<string, unknown>) || data || {}) as Record<string, unknown>
    const acts =
      (Array.isArray(rawLesson.activities) ? rawLesson.activities : undefined) ??
      (Array.isArray(data?.activities) ? data.activities : undefined) ??
      []
    const vocabs = normalizeLessonVocabs(
      (Array.isArray(rawLesson.vocabularies) ? rawLesson.vocabularies : undefined) ??
      (Array.isArray(data?.vocabularies) ? data.vocabularies : undefined) ??
      []
    )
    const vocabCount =
      (typeof rawLesson.vocabulary_count === 'number' ? rawLesson.vocabulary_count : undefined) ??
      (typeof data?.vocabulary_count === 'number' ? (data.vocabulary_count as number) : undefined) ??
      vocabs.length
    const actCount =
      (typeof rawLesson.activity_count === 'number' ? rawLesson.activity_count : undefined) ??
      (typeof data?.activity_count === 'number' ? (data.activity_count as number) : undefined) ??
      acts.length
    const lessonId = String(rawLesson._id || rawLesson.id || id)
    return {
      ...(rawLesson as unknown as InteractiveLesson),
      _id: lessonId,
      id: lessonId,
      activities: acts as InteractiveActivity[],
      vocabularies: vocabs,
      vocabulary_count: vocabCount,
      activity_count: actCount,
      status: (rawLesson.status as 'draft' | 'published') || (rawLesson.published ? 'published' : 'draft'),
      language: (rawLesson.language as 'vi' | 'en') || (data?.language as 'vi' | 'en') || 'vi',
    }
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
    const rawLesson = ((data?.lesson as Record<string, unknown>) || data || {}) as Record<string, unknown>
    const acts =
      (Array.isArray(rawLesson.activities) ? rawLesson.activities : undefined) ??
      (Array.isArray(data?.activities) ? data.activities : undefined) ??
      []
    const vocabs = normalizeLessonVocabs(
      (Array.isArray(rawLesson.vocabularies) ? rawLesson.vocabularies : undefined) ??
      (Array.isArray(data?.vocabularies) ? data.vocabularies : undefined) ??
      []
    )
    const lessonId = String(rawLesson._id || rawLesson.id || id)
    return {
      ...(rawLesson as unknown as InteractiveLesson),
      _id: lessonId,
      id: lessonId,
      activities: acts as InteractiveActivity[],
      vocabularies: vocabs,
      vocabulary_count:
        (typeof rawLesson.vocabulary_count === 'number' ? rawLesson.vocabulary_count : undefined) ??
        vocabs.length,
      activity_count:
        (typeof rawLesson.activity_count === 'number' ? rawLesson.activity_count : undefined) ??
        acts.length,
      language: (rawLesson.language as 'vi' | 'en') || (data?.language as 'vi' | 'en') || payload.language || 'vi',
    }
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

    const lessonId = String(
      sessionObj.lesson_id ??
      sessionObj.interactive_lesson_id ??
      sessionObj.lessonId ??
      (sessionObj.lesson_info as { _id?: string; id?: string })?._id ??
      (sessionObj.lesson_info as { _id?: string; id?: string })?.id ??
      ''
    ).trim()
    const classId = String(
      sessionObj.class_id ??
      sessionObj.classId ??
      (sessionObj.class_info as { _id?: string; id?: string })?._id ??
      (sessionObj.class_info as { _id?: string; id?: string })?.id ??
      ''
    ).trim()

    return {
      ...(sessionObj as unknown as InteractiveSession),
      lesson_id: lessonId,
      interactive_lesson_id: lessonId,
      class_id: classId,
      classId,
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
  // VOCABULARY SEARCH & TEACHER VOCABULARY CRUD
  // ==========================================

  searchVocabulary: async (q: string): Promise<InteractiveVocabulary[]> => {
    const trimmed = q.trim()
    if (!trimmed) return []
    try {
      // Primary: Unified search endpoint for Interactive Lessons
      const res = await api.get(
        `/interactive-lessons/vocabularies/search?q=${encodeURIComponent(trimmed)}`,
      )
      const data = unpack<unknown>(res)
      let list: Record<string, unknown>[] = []
      if (Array.isArray(data)) list = data as Record<string, unknown>[]
      else {
        const record = data as Record<string, unknown>
        if (Array.isArray(record?.vocabularies)) list = record.vocabularies as Record<string, unknown>[]
        else if (Array.isArray(record?.data)) list = record.data as Record<string, unknown>[]
      }
      return list.map((item, idx) => ({
        ...item,
        _id: String(item._id || item.id || `vocab_${idx}`),
        id: String(item._id || item.id || `vocab_${idx}`),
        word: String(item.word || ''),
        meaning: String(item.meaning || ''),
        source: (item.source as 'system' | 'teacher') || 'system',
      } as unknown as InteractiveVocabulary))
    } catch {
      // Fallback: master vocabularies search if unified search is unavailable
      try {
        const fallbackRes = await api.get(
          `/vocabularies/search?q=${encodeURIComponent(trimmed)}`,
        )
        const fbData = unpack<unknown>(fallbackRes)
        let fbList: Record<string, unknown>[] = []
        if (Array.isArray(fbData)) fbList = fbData as Record<string, unknown>[]
        else {
          const fbRecord = fbData as Record<string, unknown>
          if (Array.isArray(fbRecord?.vocabularies)) fbList = fbRecord.vocabularies as Record<string, unknown>[]
          else if (Array.isArray(fbRecord?.data)) fbList = fbRecord.data as Record<string, unknown>[]
        }
        return fbList.map((item, idx) => ({
          ...item,
          _id: String(item._id || item.id || `vocab_${idx}`),
          id: String(item._id || item.id || `vocab_${idx}`),
          word: String(item.word || ''),
          meaning: String(item.meaning || ''),
          source: (item.source as 'system' | 'teacher') || 'system',
        } as unknown as InteractiveVocabulary))
      } catch {
        return []
      }
    }
  },

  createTeacherVocabulary: async (
    payload: CreateTeacherVocabularyPayload,
  ): Promise<InteractiveVocabulary> => {
    // Backend assigns teacher_id from req.user._id; NEVER send teacher_id from FE
    const body: Record<string, unknown> = {
      word: payload.word.trim(),
      meaning: payload.meaning.trim(),
      partOfSpeech: payload.partOfSpeech || payload.part_of_speech || undefined,
      article: payload.article || undefined,
      plural: payload.plural?.trim() || undefined,
      example: payload.example?.trim() || undefined,
      exampleMeaning: payload.exampleMeaning?.trim() || payload.example_translation?.trim() || undefined,
      pronunciation: payload.pronunciation?.trim() || undefined,
      level: payload.level || undefined,
      audioUrl: payload.audioUrl || undefined,
      imageUrl: payload.imageUrl || undefined,
    }
    const res = await api.post('/teacher-vocabularies', body)
    const data = unpack<Record<string, unknown>>(res)
    const rawVocab = ((data?.vocabulary || data?.data || data || {}) as Record<string, unknown>)
    const id = String(rawVocab._id || rawVocab.id || '')
    return {
      ...(rawVocab as unknown as InteractiveVocabulary),
      _id: id,
      id,
      word: String(rawVocab.word || payload.word),
      meaning: String(rawVocab.meaning || payload.meaning),
      source: 'teacher',
    }
  },

  createVocabulary: async (
    payload: CreateTeacherVocabularyPayload & { article?: string; gender?: string },
  ): Promise<InteractiveVocabulary> => {
    return interactiveClassService.createTeacherVocabulary(payload)
  },

  getTeacherVocabularies: async (params?: {
    search?: string
    level?: string
    page?: number
    limit?: number
  }): Promise<{ vocabularies: InteractiveVocabulary[]; total?: number }> => {
    const query = new URLSearchParams()
    if (params?.search) query.append('search', params.search.trim())
    if (params?.level) query.append('level', params.level)
    if (params?.page) query.append('page', String(params.page))
    if (params?.limit) query.append('limit', String(params.limit))
    const qs = query.toString()
    const res = await api.get(`/teacher-vocabularies${qs ? `?${qs}` : ''}`)
    const data = unpack<Record<string, unknown>>(res)
    let list: Record<string, unknown>[] = []
    if (Array.isArray(data)) list = data as Record<string, unknown>[]
    else if (Array.isArray(data?.vocabularies)) list = data.vocabularies as Record<string, unknown>[]
    else if (Array.isArray(data?.data)) list = data.data as Record<string, unknown>[]
    const total = typeof data?.total === 'number' ? data.total : list.length
    return {
      vocabularies: list.map((item, idx) => ({
        ...item,
        _id: String(item._id || item.id || `tv_${idx}`),
        id: String(item._id || item.id || `tv_${idx}`),
        word: String(item.word || ''),
        meaning: String(item.meaning || ''),
        source: 'teacher',
      } as unknown as InteractiveVocabulary)),
      total,
    }
  },

  updateTeacherVocabulary: async (
    id: string,
    payload: Partial<CreateTeacherVocabularyPayload>,
  ): Promise<InteractiveVocabulary> => {
    const body: Record<string, unknown> = {
      ...(payload.word !== undefined ? { word: payload.word.trim() } : {}),
      ...(payload.meaning !== undefined ? { meaning: payload.meaning.trim() } : {}),
      ...(payload.partOfSpeech !== undefined || payload.part_of_speech !== undefined
        ? { partOfSpeech: payload.partOfSpeech || payload.part_of_speech }
        : {}),
      ...(payload.article !== undefined ? { article: payload.article } : {}),
      ...(payload.plural !== undefined ? { plural: payload.plural.trim() } : {}),
      ...(payload.example !== undefined ? { example: payload.example.trim() } : {}),
      ...(payload.exampleMeaning !== undefined || payload.example_translation !== undefined
        ? { exampleMeaning: payload.exampleMeaning?.trim() || payload.example_translation?.trim() }
        : {}),
      ...(payload.pronunciation !== undefined ? { pronunciation: payload.pronunciation.trim() } : {}),
      ...(payload.level !== undefined ? { level: payload.level } : {}),
      ...(payload.audioUrl !== undefined ? { audioUrl: payload.audioUrl } : {}),
      ...(payload.imageUrl !== undefined ? { imageUrl: payload.imageUrl } : {}),
    }
    const res = await api.put(`/teacher-vocabularies/${encodeURIComponent(id)}`, body)
    const data = unpack<Record<string, unknown>>(res)
    const rawVocab = ((data?.vocabulary || data?.data || data || {}) as Record<string, unknown>)
    return {
      ...(rawVocab as unknown as InteractiveVocabulary),
      _id: id,
      id,
      source: 'teacher',
    }
  },

  deleteTeacherVocabulary: async (id: string): Promise<void> => {
    await api.delete(`/teacher-vocabularies/${encodeURIComponent(id)}`)
  },
}
