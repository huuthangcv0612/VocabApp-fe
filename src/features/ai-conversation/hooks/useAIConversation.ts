import { useState, useCallback } from 'react'
import { AxiosError } from 'axios'
import { aiConversationService } from '../services/aiConversation.service'
import type {
  AIConversationSession,
  ConversationTurn,
  AITargetVocabulary,
  AILesson,
  AIMessage,
} from '../types/aiConversation'

/**
 * Safely extract an AIMessage from varied response shapes (string, { content }, { message }, { text })
 */
export function extractAIMessage(
  raw: unknown,
  defaultRole: 'assistant' | 'user' = 'assistant',
): AIMessage {
  if (!raw) {
    return { role: defaultRole, content: '' }
  }
  if (typeof raw === 'string') {
    return { role: defaultRole, content: raw }
  }
  const obj = raw as Record<string, unknown>
  const content =
    typeof obj.content === 'string'
      ? obj.content
      : typeof obj.message === 'string'
        ? obj.message
        : typeof obj.text === 'string'
          ? obj.text
          : ''
  const role = (obj.role as 'assistant' | 'user') || defaultRole
  return { role, content }
}

/**
 * Normalizes backend raw message/turn history into ConversationTurn[]
 * Supports:
 * 1. Flat message sequence from Mongoose:
 *    [
 *      { role: 'assistant', content: '...' }, // Turn 0: Opening AI message
 *      { role: 'user', content: '...' },      // Turn 1 user
 *      { role: 'assistant', content: '...' }, // Turn 1 AI
 *      ...
 *    ]
 * 2. Pre-formed turns:
 *    [
 *      { id: '...', user_message: {...}, ai_message: {...} }
 *    ]
 */
export function normalizeRawMessagesToTurns(
  rawList: Array<Record<string, unknown>> | undefined,
  fallbackAiMessage?: AIMessage,
  mistakes?: Array<Record<string, unknown>>,
  usedVocabulary?: ConversationTurn['used_vocabulary'],
): ConversationTurn[] {
  if (!Array.isArray(rawList) || rawList.length === 0) {
    if (fallbackAiMessage) {
      return [
        {
          id: 'turn-0-initial',
          ai_message: fallbackAiMessage,
        },
      ]
    }
    return []
  }

  // Check if rawList already contains turn objects with ai_message or user_message
  const isAlreadyTurns = rawList.some(
    (item) => item && typeof item === 'object' && ('ai_message' in item || 'user_message' in item),
  )

  if (isAlreadyTurns) {
    return rawList.map((t, idx) => {
      const userMsg = t.user_message ? extractAIMessage(t.user_message, 'user') : undefined
      const aiMsg = extractAIMessage(t.ai_message || t, 'assistant')
      return {
        id: (t.id as string) || (idx === 0 && !userMsg ? 'turn-0-initial' : `turn-${idx}`),
        user_message: userMsg,
        ai_message: aiMsg,
        feedback: t.feedback as ConversationTurn['feedback'],
        used_vocabulary: t.used_vocabulary as ConversationTurn['used_vocabulary'],
      }
    })
  }

  // Otherwise, process as flat messages: [{ role: 'assistant', content: '...' }, { role: 'user', content: '...' }]
  const turns: ConversationTurn[] = []
  let userTurnIndex = 0
  let pendingUserMsg: AIMessage | null = null

  for (let i = 0; i < rawList.length; i++) {
    const item = rawList[i]
    if (!item || typeof item !== 'object') continue

    const role = (item.role as string) || 'assistant'
    const msg = extractAIMessage(item, role === 'user' ? 'user' : 'assistant')

    if (role === 'user') {
      // If there was an uncompleted user turn, flush it
      if (pendingUserMsg) {
        userTurnIndex++
        turns.push({
          id: `turn-${userTurnIndex}`,
          user_message: pendingUserMsg,
          ai_message: { role: 'assistant', content: '' },
        })
      }
      pendingUserMsg = msg
    } else if (role === 'assistant') {
      if (pendingUserMsg) {
        // Pair user turn with assistant reply
        userTurnIndex++
        const mistake = mistakes && mistakes[userTurnIndex - 1]
        const feedback = mistake
          ? {
              is_correct: false,
              correction: (mistake.correction as string) || null,
              explanation: (mistake.explanation as string) || null,
            }
          : undefined

        turns.push({
          id: `turn-${userTurnIndex}`,
          user_message: pendingUserMsg,
          ai_message: msg,
          feedback,
          used_vocabulary: usedVocabulary,
        })
        pendingUserMsg = null
      } else {
        // Initial opening message (Turn 0) or standalone assistant message
        turns.push({
          id: turns.length === 0 ? 'turn-0-initial' : `turn-${userTurnIndex}-ai`,
          ai_message: msg,
        })
      }
    }
  }

  // Flush dangling user message if any
  if (pendingUserMsg) {
    userTurnIndex++
    turns.push({
      id: `turn-${userTurnIndex}`,
      user_message: pendingUserMsg,
      ai_message: { role: 'assistant', content: '' },
    })
  }

  // If no turns resulted, fallback to initial AI message
  if (turns.length === 0 && fallbackAiMessage) {
    turns.push({
      id: 'turn-0-initial',
      ai_message: fallbackAiMessage,
    })
  }

  return turns
}

export function useAIConversation() {
  const [session, setSession] = useState<AIConversationSession | null>(null)
  const [messages, setMessages] = useState<ConversationTurn[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusCode, setStatusCode] = useState<number | null>(null)
  const [resultData, setResultData] = useState<Record<string, unknown> | null>(null)

  /**
   * Helper to extract Axios error status code
   */
  const handleAxiosError = (err: unknown) => {
    if (err instanceof AxiosError && err.response) {
      const status = err.response.status
      setStatusCode(status)
      const data = err.response.data as { message?: string; error?: string } | undefined

      if (status === 409) {
        setError('Diese Unterhaltung ist bereits beendet.')
        setSession((prev) =>
          prev
            ? {
                ...prev,
                status: 'completed',
                isCompleted: true,
                userTurnCount: Math.max(prev.userTurnCount || 0, 3),
              }
            : null,
        )
      } else if (status === 429) {
        setError('Der KI-Dienst ist momentan ausgelastet. Bitte versuche es später erneut.')
      } else if (status === 404) {
        setError(data?.message || data?.error || 'Không tìm thấy phiên hội thoại.')
      } else if (status === 401 || status === 403) {
        setError(data?.message || data?.error || 'Bạn không có quyền thực hiện thao tác này.')
      } else if (status === 400) {
        setError(data?.message || data?.error || 'Yêu cầu không hợp lệ.')
      } else {
        setError(data?.message || data?.error || 'Đã xảy ra lỗi khi kết nối với AI.')
      }
    } else if (err instanceof Error) {
      setError(err.message)
      setStatusCode(500)
    } else {
      setError('Đã xảy ra lỗi không xác định.')
      setStatusCode(500)
    }
  }

  /**
   * Initialize a session from startConversation response data
   */
  const initFromStartData = useCallback((data: {
    session_id: string
    lesson: AILesson
    target_vocabulary: AITargetVocabulary[]
    ai_message: AIMessage | { content?: string; message?: string; text?: string; role?: string }
    turn_count?: number
    userTurnCount?: number
    isCompleted?: boolean
    scenario?: string
    status?: 'active' | 'completed'
  }) => {
    const isComp = Boolean(data.isCompleted || data.status === 'completed')
    const aiMsg: AIMessage = extractAIMessage(data.ai_message, 'assistant')

    const newSession: AIConversationSession = {
      session_id: data.session_id,
      lesson: data.lesson,
      target_vocabulary: data.target_vocabulary || [],
      ai_message: aiMsg,
      turn_count: data.turn_count || 0,
      userTurnCount: data.userTurnCount ?? 0,
      isCompleted: isComp,
      scenario: data.scenario,
      status: isComp ? 'completed' : (data.status || 'active'),
    }

    setSession(newSession)
    setMessages([
      {
        id: 'turn-0-initial',
        ai_message: aiMsg,
      },
    ])
    setResultData(null)
    setError(null)
    setStatusCode(null)
  }, [setResultData])

  /**
   * Load/restore an existing conversation session via GET /api/ai/conversations/:sessionId
   */
  const loadSession = useCallback(async (sessionId: string) => {
    if (!sessionId) return
    try {
      setLoading(true)
      setError(null)
      setStatusCode(null)

      const rawData = await aiConversationService.getConversation(sessionId)
      const data = (rawData || {}) as Record<string, unknown>

      const lessonObj = (data.lesson || {}) as AILesson
      const targetVocab = (Array.isArray(data.target_vocabulary)
        ? data.target_vocabulary
        : []) as AITargetVocabulary[]
      const statusVal = (data.status as 'active' | 'completed') || 'active'
      const turnCountVal = typeof data.turn_count === 'number' ? data.turn_count : 0
      const userTurnCountVal = typeof data.userTurnCount === 'number' ? data.userTurnCount : turnCountVal
      const isCompVal = Boolean(data.isCompleted || statusVal === 'completed' || userTurnCountVal >= 3)

      const rawTurns = (data.messages || data.history || data.turns) as Array<Record<string, unknown>> | undefined

      // Safely extract opening AI message: prefer data.ai_message, else look at first message in rawTurns, else fallback
      const initialAiMsg: AIMessage = extractAIMessage(
        data.ai_message ||
          (Array.isArray(rawTurns) &&
            rawTurns.length > 0 &&
            ('ai_message' in rawTurns[0]
              ? rawTurns[0].ai_message
              : rawTurns[0].role === 'assistant'
                ? rawTurns[0]
                : null)) || {
            role: 'assistant',
            content: 'Hallo! Wie geht es dir heute?',
          },
        'assistant',
      )

      const loadedSession: AIConversationSession = {
        session_id: sessionId,
        lesson: lessonObj,
        target_vocabulary: targetVocab,
        ai_message: initialAiMsg,
        turn_count: turnCountVal,
        userTurnCount: userTurnCountVal,
        isCompleted: isCompVal,
        scenario: typeof data.scenario === 'string' ? data.scenario : undefined,
        status: isCompVal ? 'completed' : statusVal,
      }

      setSession(loadedSession)

      // Normalize raw message sequence into ConversationTurn[]
      const parsedTurns = normalizeRawMessagesToTurns(
        rawTurns,
        initialAiMsg,
        data.mistakes as Array<Record<string, unknown>> | undefined,
        data.used_vocabulary as ConversationTurn['used_vocabulary'],
      )
      setMessages(parsedTurns)

      if (isCompVal) {
        setResultData(data)
      }
    } catch (err: unknown) {
      handleAxiosError(err)
    } finally {
      setLoading(false)
    }
  }, [setResultData])

  /**
   * Start a brand new session with a lesson_id
   */
  const startNewSession = useCallback(async (lessonId: string): Promise<string | null> => {
    try {
      setLoading(true)
      setError(null)
      setStatusCode(null)

      const startData = await aiConversationService.startConversation(lessonId)
      initFromStartData(startData)
      return startData.session_id
    } catch (err: unknown) {
      handleAxiosError(err)
      return null
    } finally {
      setLoading(false)
    }
  }, [initFromStartData])

  /**
   * Send a user message in the active session
   */
  const sendMessage = useCallback(async (messageText: string) => {
    if (
      !session ||
      sending ||
      session.status === 'completed' ||
      session.isCompleted ||
      (session.userTurnCount !== undefined && session.userTurnCount >= 3)
    ) {
      return
    }

    try {
      setSending(true)
      setError(null)

      const resData = await aiConversationService.sendMessage(session.session_id, messageText)

      const nextUserTurnCount =
        typeof resData.userTurnCount === 'number'
          ? resData.userTurnCount
          : (session.userTurnCount ?? 0) + 1

      const isComp = Boolean(
        resData.isCompleted ||
        resData.status === 'completed' ||
        nextUserTurnCount >= 3
      )

      const resAiMsg = extractAIMessage(resData.ai_message, 'assistant')
      const resUserMsg = resData.user_message
        ? extractAIMessage(resData.user_message, 'user')
        : { role: 'user' as const, content: messageText }

      // Append new turn to messages history
      const newTurn: ConversationTurn = {
        id: `turn-${nextUserTurnCount || resData.turn_count || messages.length + 1}`,
        user_message: resUserMsg,
        ai_message: resAiMsg,
        feedback: resData.feedback,
        used_vocabulary: resData.used_vocabulary,
      }

      setMessages((prev) => [...prev, newTurn])

      // Update session turn count, userTurnCount, scenario, and status
      setSession((prev) => {
        if (!prev) return null
        return {
          ...prev,
          turn_count: resData.turn_count ?? prev.turn_count,
          userTurnCount: nextUserTurnCount,
          scenario: resData.scenario || prev.scenario,
          status: isComp ? 'completed' : (resData.status || prev.status),
          isCompleted: isComp,
        }
      })

      // If completed after this message
      if (isComp) {
        setResultData(resData as unknown as Record<string, unknown>)
      }
    } catch (err: unknown) {
      handleAxiosError(err)
    } finally {
      setSending(false)
    }
  }, [session, sending, messages.length, setResultData])


  /**
   * Complete the active session explicitly
   */
  const completeSession = useCallback(async () => {
    if (!session || completing) return

    try {
      setCompleting(true)
      setError(null)

      const summary = await aiConversationService.completeConversation(session.session_id)

      setSession((prev) => (prev ? { ...prev, status: 'completed' } : null))
      setResultData((summary as Record<string, unknown>) || {})
    } catch (err: unknown) {
      handleAxiosError(err)
    } finally {
      setCompleting(false)
    }
  }, [session, completing, setResultData])

  return {
    session,
    messages,
    loading,
    sending,
    completing,
    error,
    statusCode,
    resultData,
    initFromStartData,
    loadSession,
    startNewSession,
    sendMessage,
    completeSession,
  }
}

export default useAIConversation
