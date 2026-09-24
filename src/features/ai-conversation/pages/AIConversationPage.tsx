import React, { useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import { useAIConversation } from '../hooks/useAIConversation'
import { useAITextToSpeech } from '../hooks/useAITextToSpeech'
import { AIConversationHeader } from '../components/AIConversationHeader'
import { AIMessageBubble } from '../components/AIMessageBubble'
import { UserMessageBubble } from '../components/UserMessageBubble'
import { AIConversationInput } from '../components/AIConversationInput'
import { AITargetVocabulary } from '../components/AITargetVocabulary'
import { AIConversationLoading } from '../components/AIConversationLoading'
import { AIConversationError } from '../components/AIConversationError'
import { useSubscription } from '../../../hooks/useSubscription'
import '../styles/aiConversation.css'

export const AIConversationPage: React.FC = () => {
  const { t } = useTranslation('ai')
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const chatBoxRef = useRef<HTMLDivElement>(null)
  const lastSpokenTurnIdRef = useRef<string | null>(null)
  const loadedSessionIdRef = useRef<string | null>(null)
  const { isPremium, loading: subLoading } = useSubscription()

  const {
    session,
    messages,
    loading,
    sending,
    completing,
    error,
    statusCode,
    initFromStartData,
    loadSession,
    startNewSession,
    sendMessage,
    completeSession,
  } = useAIConversation()

  const {
    audioStatus,
    isAISpeaking,
    isAutoplayBlocked,
    error: audioError,
    currentSpeakingText,
    speak,
    retryAutoplay,
    stop: stopTTS,
  } = useAITextToSpeech()

  // Initialize session: use router state for immediate start or load from API
  useEffect(() => {
    if (!sessionId || (!subLoading && !isPremium)) return

    // If hook state already has this session and messages initialized in memory, do not re-fetch
    if (session && session.session_id === sessionId && messages.length > 0) {
      loadedSessionIdRef.current = sessionId
      return
    }

    // Prevent duplicate loading for the same sessionId
    if (loadedSessionIdRef.current === sessionId) return

    const stateData = location.state?.sessionData
    if (stateData && stateData.session_id === sessionId) {
      loadedSessionIdRef.current = sessionId
      initFromStartData(stateData)
      return
    }

    loadedSessionIdRef.current = sessionId
    loadSession(sessionId)
  }, [sessionId, location.state, initFromStartData, loadSession, session, messages.length])

  // Smooth scroll to bottom of chat box when messages change or while sending
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight
    }
  }, [messages, sending])

  // Helpers to prevent duplicate TTS playback for already-spoken messages
  const isTurnSpoken = (sId: string, turnId: string): boolean => {
    try {
      return sessionStorage.getItem(`tts_spoken_${sId}_${turnId}`) === 'true'
    } catch {
      return false
    }
  }

  const markTurnSpoken = (sId: string, turnId: string): void => {
    try {
      sessionStorage.setItem(`tts_spoken_${sId}_${turnId}`, 'true')
    } catch {
      // Ignore storage access errors in private browsing modes
    }
  }

  // Auto-play TTS when a new AI message arrives (opening message or follow-up response)
  useEffect(() => {
    if (!session || !sessionId || messages.length === 0) {
      return
    }

    const latestTurn = messages[messages.length - 1]
    if (!latestTurn || !latestTurn.ai_message) return

    // Never speak user messages
    if (latestTurn.ai_message.role !== 'assistant') return

    const turnId = latestTurn.id || `turn-${messages.length - 1}`

    // Skip if already spoken in current runtime or in sessionStorage for this tab
    if (lastSpokenTurnIdRef.current === turnId || isTurnSpoken(sessionId, turnId)) {
      return
    }

    // Mark as spoken immediately so rerenders do not trigger duplicate calls
    lastSpokenTurnIdRef.current = turnId
    markTurnSpoken(sessionId, turnId)

    // Trigger Azure TTS
    const textToSpeak =
      latestTurn.ai_message.content ||
      (latestTurn.ai_message as unknown as { message?: string })?.message ||
      ''
    if (textToSpeak) {
      speak(textToSpeak)
    }
  }, [messages, session, sessionId, speak])

  const handleExit = () => {
    stopTTS()
    navigate('/learning-path')
  }

  const handleRestart = async () => {
    stopTTS()
    if (session?.lesson?._id) {
      const newSessionId = await startNewSession(session.lesson._id)
      if (newSessionId) {
        loadedSessionIdRef.current = newSessionId
        navigate(`/ai-conversation/${newSessionId}`)
      }
    } else {
      navigate('/learning-path')
    }
  }

  const handleReplayMessage = (text: string) => {
    speak(text)
  }

  if (!subLoading && !isPremium) {
    return (
      <div className="ai-conversation-page">
        <Header />
        <main className="ai-conversation-container">
          <AIConversationError
            statusCode={403}
            onExit={handleExit}
          />
        </main>
        <Footer />
      </div>
    )
  }

  if (loading && !session) {
    return (
      <div className="ai-conversation-page">
        <Header />
        <main className="ai-conversation-container">
          <AIConversationLoading />
        </main>
        <Footer />
      </div>
    )
  }

  if (error && !session) {
    return (
      <div className="ai-conversation-page">
        <Header />
        <main className="ai-conversation-container">
          <AIConversationError
            message={error}
            statusCode={statusCode}
            onRetry={sessionId ? () => loadSession(sessionId) : undefined}
            onExit={handleExit}
          />
        </main>
        <Footer />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="ai-conversation-page">
        <Header />
        <main className="ai-conversation-container">
          <AIConversationError
            statusCode={404}
            onExit={handleExit}
          />
        </main>
        <Footer />
      </div>
    )
  }

  const isCompleted = Boolean(
    session.isCompleted ||
    session.status === 'completed' ||
    (typeof session.userTurnCount === 'number' && session.userTurnCount >= 3)
  )

  return (
    <div className="ai-conversation-page">
      <Header />

      <main className="ai-conversation-container">
        <AIConversationHeader
          lesson={session.lesson}
          turnCount={session.turn_count}
          userTurnCount={session.userTurnCount}
          maxTurns={3}
          onComplete={completeSession}
          onExit={handleExit}
          isCompleting={completing}
          status={session.status}
          isCompleted={isCompleted}
        />

        {/* Scenario Display */}
        {session.scenario && (
          <div className="ai-scenario-card" aria-label={t('conversation.situation')}>
            <div className="ai-scenario-badge">
              <span className="ai-scenario-icon" aria-hidden="true">🎭</span>
              <span>{t('conversation.situation')}</span>
            </div>
            <p className="ai-scenario-text">{session.scenario}</p>
          </div>
        )}

        <AITargetVocabulary vocabularies={session.target_vocabulary} />

        {/* Autoplay blocked prompt banner */}
        {isAutoplayBlocked && (
          <div
            className="ai-autoplay-banner"
            onClick={retryAutoplay}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                retryAutoplay()
              }
            }}
          >
            <span className="ai-autoplay-icon" aria-hidden="true">🔊</span>
            <div className="ai-autoplay-info">
              <strong>{t('conversation.promptAutoplay')}</strong>
              <span>{t('conversation.promptAutoplayDesc')}</span>
            </div>
            <button type="button" className="ai-autoplay-btn">
              {t('conversation.listenNow')}
            </button>
          </div>
        )}

        {/* Conversation history is always preserved */}
        <div className="ai-chat-box" ref={chatBoxRef}>
          {messages.map((turn) => {
            const turnAiText =
              turn.ai_message?.content ||
              (turn.ai_message as unknown as { message?: string })?.message ||
              ''
            return (
              <React.Fragment key={turn.id}>
                {turn.user_message && (
                  <UserMessageBubble message={turn.user_message} />
                )}
                {turn.ai_message && (
                  <AIMessageBubble
                    message={turn.ai_message}
                    feedback={turn.feedback}
                    onReplay={handleReplayMessage}
                    isPlaying={isAISpeaking && currentSpeakingText === turnAiText}
                    isLoading={audioStatus === 'loading' && currentSpeakingText === turnAiText}
                  />
                )}
              </React.Fragment>
            )
          })}

          {sending && (
            <div className="ai-typing-indicator">
              <div className="ai-spinner-small" />
              <span>{t('conversation.thinking')}</span>
            </div>
          )}
        </div>

        {/* Audio status banner */}
        {audioStatus === 'loading' && (
          <div className="ai-audio-status-banner loading">
            <div className="ai-spinner-small" />
            <span>{t('conversation.preparingVoice')}</span>
          </div>
        )}

        {audioStatus === 'playing' && (
          <div className="ai-audio-status-banner playing">
            <span className="ai-audio-wave-anim">🔊</span>
            <span>{t('conversation.speaking')}</span>
          </div>
        )}

        {audioError && (
          <div className="ai-audio-status-banner error">
            <span>⚠️ {audioError}</span>
          </div>
        )}

        {/* Error notification banner */}
        {error && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fca5a5',
              color: '#991b1b',
              borderRadius: '12px',
              padding: '10px 14px',
              marginBottom: '12px',
              fontSize: '0.88rem',
              fontWeight: 500,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Completed status card when 3 user replies finished */}
        {isCompleted ? (
          <div className="ai-completed-card">
            <div className="ai-completed-header">
              <span className="ai-completed-badge">{t('conversation.completedTitle')}</span>
              <span className="ai-completed-turn-count">{t('conversation.answersGiven')}</span>
            </div>
            <p className="ai-completed-desc">
              {t('conversation.praiseText')}
            </p>
            <div className="ai-completed-actions">
              <button
                onClick={handleRestart}
                className="ai-completed-btn restart"
              >
                {t('conversation.restartPractice')}
              </button>
              <button
                onClick={handleExit}
                className="ai-completed-btn exit"
              >
                {t('conversation.backToPath')}
              </button>
            </div>
          </div>
        ) : (
          <AIConversationInput
            onSendMessage={sendMessage}
            sending={sending}
            status={session.status}
            isCompleted={isCompleted}
            userTurnCount={session.userTurnCount}
            isAISpeaking={isAISpeaking}
            audioStatus={audioStatus}
          />
        )}
      </main>

      <Footer />
    </div>
  )
}

export default AIConversationPage

