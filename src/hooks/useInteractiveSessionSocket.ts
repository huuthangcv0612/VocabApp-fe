import { useEffect, useState, useCallback, useRef } from 'react'
import { socketService } from '../services/socketService'
import type {
  InteractiveSession,
  SessionConnectedStudent,
  SessionResponseRecord,
  ActivityType,
} from '../types/interactiveClass'
import type { VocabularyItem } from '../types/vocabulary'

interface UseInteractiveSessionSocketOptions {
  sessionId?: string
  isTeacher?: boolean
  initialSession?: InteractiveSession | null
  onSessionUpdated?: (session: Partial<InteractiveSession>) => void
  onActivityStarted?: (data: Record<string, unknown>) => void
  onNextItem?: (data: Record<string, unknown>) => void
  onShowAnswer?: (data: Record<string, unknown>) => void
  onSpinResult?: (data: unknown) => void
  onStudentJoined?: (student: SessionConnectedStudent) => void
  onStudentAnswered?: (response: SessionResponseRecord) => void
  onSessionEnded?: () => void
}

export const normalizeStudentId = (
  student: Record<string, unknown> | SessionConnectedStudent | null | undefined,
): string => {
  if (!student) return ''
  const s = student as Record<string, unknown>
  const user = (s.user as Record<string, unknown>) || {}
  const rawId =
    s.id ??
    s._id ??
    s.student_id ??
    s.user_id ??
    user.id ??
    user._id ??
    user.student_id
  if (rawId === null || rawId === undefined) return ''
  return String(rawId).trim()
}

export const useInteractiveSessionSocket = ({
  sessionId,
  isTeacher = false,
  initialSession,
  onSessionUpdated,
  onActivityStarted,
  onNextItem,
  onShowAnswer,
  onSpinResult,
  onStudentJoined,
  onStudentAnswered,
  onSessionEnded,
}: UseInteractiveSessionSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false)
  const [liveSession, setLiveSession] = useState<InteractiveSession | null>(initialSession || null)
  const [connectedStudents, setConnectedStudents] = useState<SessionConnectedStudent[]>(() => {
    if (!initialSession?.connected_students || !Array.isArray(initialSession.connected_students)) {
      return []
    }
    const unique: SessionConnectedStudent[] = []
    const seen = new Set<string>()
    for (const item of initialSession.connected_students) {
      const id = normalizeStudentId(item)
      if (!id || seen.has(id)) continue
      seen.add(id)
      unique.push({
        id,
        _id: id,
        student_id: item.student_id || id,
        user_id: item.user_id || id,
        name: String(item.name || 'Học viên').trim() || 'Học viên',
        avatar: item.avatar,
        score: typeof item.score === 'number' ? item.score : 0,
        joined_at: item.joined_at,
      })
    }
    return unique
  })
  const [responses, setResponses] = useState<SessionResponseRecord[]>(
    initialSession?.responses || [],
  )

  const callbacksRef = useRef({
    onSessionUpdated,
    onActivityStarted,
    onNextItem,
    onShowAnswer,
    onSpinResult,
    onStudentJoined,
    onStudentAnswered,
    onSessionEnded,
  })

  useEffect(() => {
    callbacksRef.current = {
      onSessionUpdated,
      onActivityStarted,
      onNextItem,
      onShowAnswer,
      onSpinResult,
      onStudentJoined,
      onStudentAnswered,
      onSessionEnded,
    }
  }, [
    onSessionUpdated,
    onActivityStarted,
    onNextItem,
    onShowAnswer,
    onSpinResult,
    onStudentJoined,
    onStudentAnswered,
    onSessionEnded,
  ])

  useEffect(() => {
    if (initialSession) {
      setLiveSession((prev) => prev || initialSession)
      if (initialSession.connected_students && Array.isArray(initialSession.connected_students)) {
        const unique: SessionConnectedStudent[] = []
        const seen = new Set<string>()
        for (const item of initialSession.connected_students) {
          const id = normalizeStudentId(item)
          if (!id || seen.has(id)) continue
          seen.add(id)
          unique.push({
            id,
            _id: id,
            student_id: item.student_id || id,
            user_id: item.user_id || id,
            name: String(item.name || 'Học viên').trim() || 'Học viên',
            avatar: item.avatar,
            score: typeof item.score === 'number' ? item.score : 0,
            joined_at: item.joined_at,
          })
        }
        setConnectedStudents(unique)
      }
      if (initialSession.responses) {
        setResponses(initialSession.responses)
      }
    }
  }, [initialSession])

  useEffect(() => {
    if (!sessionId) return

    const socket = socketService.connect()

    const handleJoinAck = (ackResponse: unknown) => {
      const ack = ackResponse as Record<string, unknown> | undefined
      if (ack && typeof ack === 'object') {
        const rawList = Array.isArray(ack.students)
          ? (ack.students as Record<string, unknown>[])
          : Array.isArray(ack.connected_students)
          ? (ack.connected_students as Record<string, unknown>[])
          : []
        if (rawList.length > 0) {
          const unique: SessionConnectedStudent[] = []
          const seen = new Set<string>()
          for (const item of rawList) {
            const id = normalizeStudentId(item)
            if (!id || seen.has(id)) continue
            seen.add(id)
            unique.push({
              id,
              _id: id,
              student_id: (item.student_id as string) || id,
              user_id: (item.user_id as string) || id,
              name: String(item.name ?? item.student_name ?? 'Học viên').trim() || 'Học viên',
              avatar: item.avatar as string | undefined,
              score: typeof item.score === 'number' ? item.score : 0,
              joined_at: item.joined_at as string | undefined,
            })
          }
          setConnectedStudents(unique)
        }
      }
    }

    const handleConnect = () => {
      setIsConnected(true)
      socketService.joinSessionRoom(sessionId, isTeacher, handleJoinAck)
    }

    const handleDisconnect = () => {
      setIsConnected(false)
    }

    if (socket.connected) {
      setIsConnected(true)
      socketService.joinSessionRoom(sessionId, isTeacher, handleJoinAck)
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)

    // Event: session:started
    const unsubSessionStarted = socketService.on('session:started', (raw: unknown) => {
      const data = (raw as Record<string, unknown>) || {}
      console.log('[Socket] session:started', data)
      setLiveSession((prev) => ({ ...(prev || {}), ...data, status: 'active' } as InteractiveSession))
      callbacksRef.current.onSessionUpdated?.(data as Partial<InteractiveSession>)
    })

    // Event: session:connected-students
    const unsubConnectedStudents = socketService.on('session:connected-students', (raw: unknown) => {
      const data = (raw as Record<string, unknown>) || {}
      console.log('[Socket] session:connected-students', data)
      const rawList = Array.isArray(raw)
        ? (raw as Record<string, unknown>[])
        : Array.isArray(data.students)
        ? (data.students as Record<string, unknown>[])
        : Array.isArray(data.connected_students)
        ? (data.connected_students as Record<string, unknown>[])
        : []

      const uniqueStudents: SessionConnectedStudent[] = []
      const seenIds = new Set<string>()

      for (const st of rawList) {
        const id = normalizeStudentId(st)
        if (!id || seenIds.has(id)) continue
        seenIds.add(id)
        uniqueStudents.push({
          id,
          _id: id,
          student_id: (st.student_id as string) || id,
          user_id: (st.user_id as string) || id,
          name: String(st.name ?? st.student_name ?? 'Học viên').trim() || 'Học viên',
          avatar: st.avatar as string | undefined,
          score: typeof st.score === 'number' ? st.score : 0,
          joined_at: st.joined_at as string | undefined,
        })
      }

      setConnectedStudents(uniqueStudents)
    })

    // Event: student:joined
    const unsubStudentJoined = socketService.on('student:joined', (raw: unknown) => {
      const studentData = (raw as Record<string, unknown>) || {}
      console.log('[Socket] student:joined', studentData)
      const id = normalizeStudentId(studentData)
      if (!id) return

      const studentName = String(
        studentData.name ?? studentData.student_name ?? ''
      ).trim() || 'Học viên'

      const student: SessionConnectedStudent = {
        id,
        _id: id,
        student_id: (studentData.student_id as string) || id,
        user_id: (studentData.user_id as string) || id,
        name: studentName,
        avatar: studentData.avatar as string | undefined,
        score: typeof studentData.score === 'number' ? studentData.score : 0,
        joined_at: (studentData.joined_at as string) || undefined,
      }

      setConnectedStudents((prev) => {
        if (prev.some((s) => normalizeStudentId(s) === id)) {
          return prev.map((s) =>
            normalizeStudentId(s) === id
              ? {
                  ...s,
                  name: studentName !== 'Học viên' ? studentName : s.name,
                  avatar: student.avatar || s.avatar,
                  score: typeof studentData.score === 'number' ? studentData.score : s.score,
                }
              : s,
          )
        }
        return [...prev, student]
      })

      callbacksRef.current.onStudentJoined?.(student)
    })

    // Event: student:left
    const unsubStudentLeft = socketService.on('student:left', (raw: unknown) => {
      const leftData = (raw as Record<string, unknown>) || {}
      console.log('[Socket] student:left', leftData)
      const id = normalizeStudentId(leftData)
      if (!id) return

      setConnectedStudents((prev) => prev.filter((s) => normalizeStudentId(s) !== id))
    })

    // Event: activity:started
    const unsubActivityStarted = socketService.on('activity:started', (raw: unknown) => {
      const data = (raw as Record<string, unknown>) || {}
      console.log('[Socket] activity:started', data)
      const actObj = data.activity as Record<string, unknown> | undefined
      setLiveSession((prev) => {
        if (!prev) return null
        return {
          ...prev,
          current_activity_id: String(data.activity_id || actObj?._id || data.id || ''),
          current_activity_type: (data.type || data.activity_type) as ActivityType | undefined,
          current_item_index: 0,
          current_item: (data.item || data.current_item || null) as VocabularyItem | null,
          show_answer: false,
        }
      })
      setResponses([])
      callbacksRef.current.onActivityStarted?.(data)
      callbacksRef.current.onSessionUpdated?.(data as Partial<InteractiveSession>)
    })

    // Event: session:next-item
    const unsubNextItem = socketService.on('session:next-item', (raw: unknown) => {
      const data = (raw as Record<string, unknown>) || {}
      console.log('[Socket] session:next-item', data)
      setLiveSession((prev) => {
        if (!prev) return null
        return {
          ...prev,
          current_item_index:
            typeof data.index === 'number'
              ? data.index
              : typeof data.current_item_index === 'number'
              ? data.current_item_index
              : (prev.current_item_index || 0) + 1,
          current_item: (data.item || data.current_item || prev.current_item) as VocabularyItem | null,
          show_answer: false,
        }
      })
      setResponses([])
      callbacksRef.current.onNextItem?.(data)
      callbacksRef.current.onSessionUpdated?.(data as Partial<InteractiveSession>)
    })

    // Event: session:show-answer
    const unsubShowAnswer = socketService.on('session:show-answer', (raw: unknown) => {
      const data = (raw as Record<string, unknown>) || {}
      console.log('[Socket] session:show-answer', data)
      setLiveSession((prev) => {
        if (!prev) return null
        return {
          ...prev,
          show_answer: true,
        }
      })
      callbacksRef.current.onShowAnswer?.(data)
    })

    // Event: student:answered
    const unsubStudentAnswered = socketService.on('student:answered', (raw: unknown) => {
      const answerData = (raw as Record<string, unknown>) || {}
      console.log('[Socket] student:answered', answerData)
      const studentId = normalizeStudentId(answerData) || String(answerData.student_id || answerData.userId || '')
      const studentName = String(
        answerData.student_name ?? answerData.name ?? ''
      ).trim() || undefined

      const record: SessionResponseRecord = {
        student_id: studentId,
        student_name: studentName,
        answer: (answerData.answer as string | number | boolean | Record<string, unknown>) ?? '',
        is_correct: answerData.is_correct as boolean | undefined,
        created_at: new Date().toISOString(),
      }

      setResponses((prev) => {
        const filtered = prev.filter((r) => r.student_id !== record.student_id)
        return [...filtered, record]
      })

      callbacksRef.current.onStudentAnswered?.(record)
    })

    // Event: session:spun
    const unsubSessionSpun = socketService.on('session:spun', (raw: unknown) => {
      console.log('[Socket] session:spun', raw)
      setLiveSession((prev) => {
        if (!prev) return null
        return {
          ...prev,
          spin_result: raw as { word?: string; vocabulary?: VocabularyItem },
        }
      })
      callbacksRef.current.onSpinResult?.(raw)
    })

    // Event: session:ended
    const unsubSessionEnded = socketService.on('session:ended', () => {
      console.log('[Socket] session:ended')
      setLiveSession((prev) => {
        if (!prev) return null
        return {
          ...prev,
          status: 'ended',
        }
      })
      callbacksRef.current.onSessionEnded?.()
    })

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      unsubSessionStarted()
      unsubConnectedStudents()
      unsubStudentJoined()
      unsubStudentLeft()
      unsubActivityStarted()
      unsubNextItem()
      unsubShowAnswer()
      unsubStudentAnswered()
      unsubSessionSpun()
      unsubSessionEnded()
      socketService.leaveSessionRoom(sessionId)
    }
  }, [sessionId, isTeacher])

  // Emitters
  const emitStartActivity = useCallback(
    (activityId: string, type: string) => {
      if (!sessionId) return
      socketService.emit('teacher:start-activity', {
        sessionId,
        activity_id: activityId,
        type,
      })
    },
    [sessionId],
  )

  const emitNext = useCallback(() => {
    if (!sessionId) return
    socketService.emit('teacher:next', { sessionId })
  }, [sessionId])

  const emitShowAnswer = useCallback(() => {
    if (!sessionId) return
    socketService.emit('teacher:show-answer', { sessionId })
  }, [sessionId])

  const emitSpin = useCallback(() => {
    if (!sessionId) return
    socketService.emit('teacher:spin', { sessionId })
  }, [sessionId])

  const emitSubmitAnswer = useCallback(
    (answer: string | number | boolean | Record<string, unknown>) => {
      if (!sessionId) return
      socketService.emit('student:submit-answer', { sessionId, answer })
    },
    [sessionId],
  )

  const emitEndSession = useCallback(() => {
    if (!sessionId) return
    socketService.emit('teacher:end-session', { sessionId })
  }, [sessionId])

  return {
    isConnected,
    liveSession,
    setLiveSession,
    connectedStudents,
    responses,
    emitStartActivity,
    emitNext,
    emitShowAnswer,
    emitSpin,
    emitSubmitAnswer,
    emitEndSession,
  }
}
