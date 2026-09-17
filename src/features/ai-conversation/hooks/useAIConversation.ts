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
      setStatusCode(err.response.status)
      const data = err.response.data as { message?: string; error?: string } | undefined
      setError(data?.message || data?.error || err.message)
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
    ai_message: AIMessage
    turn_count: number
    status: 'active' | 'completed'
  }) => {
    const newSession: AIConversationSession = {
      session_id: data.session_id,
      lesson: data.lesson,
      target_vocabulary: data.target_vocabulary || [],
      ai_message: data.ai_message,
      turn_count: data.turn_count || 0,
      status: data.status || 'active',
    }

    setSession(newSession)
    setMessages([
      {
        id: 'turn-0-initial',
        ai_message: data.ai_message,
      },
    ])
    setResultData(null)
    setError(null)
    setStatusCode(null)
  }, [])

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
      const initialAiMsg = (data.ai_message || {
        role: 'assistant',
        content: 'Hallo! Wie geht es dir heute?',
      }) as AIMessage

      const loadedSession: AIConversationSession = {
        session_id: sessionId,
        lesson: lessonObj,
        target_vocabulary: targetVocab,
        ai_message: initialAiMsg,
        turn_count: turnCountVal,
        status: statusVal,
      }

      setSession(loadedSession)

      // Reconstruct turns array if backend returns message history
      const rawTurns = (data.messages || data.history || data.turns) as Array<Record<string, unknown>> | undefined

      if (Array.isArray(rawTurns) && rawTurns.length > 0) {
        const parsedTurns: ConversationTurn[] = rawTurns.map((t, idx) => ({
          id: (t.id as string) || `turn-${idx}`,
          user_message: t.user_message as AIMessage | undefined,
          ai_message: t.ai_message as AIMessage,
          feedback: t.feedback as ConversationTurn['feedback'],
          used_vocabulary: t.used_vocabulary as ConversationTurn['used_vocabulary'],
        }))
        setMessages(parsedTurns)
      } else {
        // Fallback: seed with initial AI message
        setMessages([
          {
            id: 'turn-0-initial',
            ai_message: initialAiMsg,
          },
        ])
      }

      if (statusVal === 'completed') {
        setResultData(data)
      }
    } catch (err: unknown) {
      handleAxiosError(err)
    } finally {
      setLoading(false)
    }
  }, [])

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
    if (!session || sending || session.status === 'completed') return

    try {
      setSending(true)
      setError(null)

      const resData = await aiConversationService.sendMessage(session.session_id, messageText)

      // Append new turn to messages history
      const newTurn: ConversationTurn = {
        id: `turn-${resData.turn_count || messages.length + 1}`,
        user_message: resData.user_message,
        ai_message: resData.ai_message,
        feedback: resData.feedback,
        used_vocabulary: resData.used_vocabulary,
      }

      setMessages((prev) => [...prev, newTurn])

      // Update session turn count and status
      setSession((prev) => {
        if (!prev) return null
        return {
          ...prev,
          turn_count: resData.turn_count,
          status: resData.status,
        }
      })

      // If status completed after this message
      if (resData.status === 'completed') {
        // Complete call if needed or show result
        setResultData(resData as unknown as Record<string, unknown>)
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response?.status === 409) {
        // Session completed conflict
        setSession((prev) => (prev ? { ...prev, status: 'completed' } : null))
      }
      handleAxiosError(err)
    } finally {
      setSending(false)
    }
  }, [session, sending, messages.length])

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
  }, [session, completing])

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
