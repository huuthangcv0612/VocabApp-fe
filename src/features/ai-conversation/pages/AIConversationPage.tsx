import React, { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import { useAIConversation } from '../hooks/useAIConversation'
import { AIConversationHeader } from '../components/AIConversationHeader'
import { AIMessageBubble } from '../components/AIMessageBubble'
import { UserMessageBubble } from '../components/UserMessageBubble'
import { AIConversationInput } from '../components/AIConversationInput'
import { AITargetVocabulary } from '../components/AITargetVocabulary'
import { AIConversationResult } from '../components/AIConversationResult'
import { AIConversationLoading } from '../components/AIConversationLoading'
import { AIConversationError } from '../components/AIConversationError'
import '../styles/aiConversation.css'

export const AIConversationPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const chatBoxRef = useRef<HTMLDivElement>(null)

  const {
    session,
    messages,
    loading,
    sending,
    completing,
    error,
    statusCode,
    resultData,
    loadSession,
    startNewSession,
    sendMessage,
    completeSession,
  } = useAIConversation()

  // Load session on mount or when sessionId changes
  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId)
    }
  }, [sessionId, loadSession])

  // Smooth scroll to bottom of chat box when messages change or while sending
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight
    }
  }, [messages, sending])

  const handleExit = () => {
    navigate('/learning-path')
  }

  const handleRestart = async () => {
    if (session?.lesson?._id) {
      const newSessionId = await startNewSession(session.lesson._id)
      if (newSessionId) {
        navigate(`/ai-conversation/${newSessionId}`)
      }
    } else {
      navigate('/learning-path')
    }
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

  const isCompleted = session.status === 'completed'

  return (
    <div className="ai-conversation-page">
      <Header />

      <main className="ai-conversation-container">
        <AIConversationHeader
          lesson={session.lesson}
          turnCount={session.turn_count}
          maxTurns={10}
          onComplete={completeSession}
          onExit={handleExit}
          isCompleting={completing}
          status={session.status}
        />

        {isCompleted ? (
          <AIConversationResult
            resultData={resultData}
            turnCount={session.turn_count}
            onRestart={handleRestart}
            onExit={handleExit}
          />
        ) : (
          <>
            <AITargetVocabulary vocabularies={session.target_vocabulary} />

            <div className="ai-chat-box" ref={chatBoxRef}>
              {messages.map((turn) => (
                <React.Fragment key={turn.id}>
                  {turn.user_message && (
                    <UserMessageBubble message={turn.user_message} />
                  )}
                  {turn.ai_message && (
                    <AIMessageBubble
                      message={turn.ai_message}
                      feedback={turn.feedback}
                    />
                  )}
                </React.Fragment>
              ))}

              {sending && (
                <div className="ai-typing-indicator">
                  <div className="ai-spinner-small" />
                  <span>AI đang suy nghĩ...</span>
                </div>
              )}
            </div>

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
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <AIConversationInput
              onSendMessage={sendMessage}
              sending={sending}
              status={session.status}
            />
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default AIConversationPage
