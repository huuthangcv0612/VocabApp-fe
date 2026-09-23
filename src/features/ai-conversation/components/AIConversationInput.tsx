import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import type { AudioStatus } from '../hooks/useAITextToSpeech'

interface AIConversationInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
  sending?: boolean
  status?: string
  isCompleted?: boolean
  userTurnCount?: number
  isAISpeaking?: boolean
  audioStatus?: AudioStatus
}

export const AIConversationInput: React.FC<AIConversationInputProps> = ({
  onSendMessage,
  disabled = false,
  sending = false,
  status = 'active',
  isCompleted = false,
  userTurnCount,
  isAISpeaking = false,
  audioStatus = 'idle',
}) => {
  const { t } = useTranslation('ai')
  const [text, setText] = useState('')

  const {
    isListening,
    isSupported: isMicSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition((spokenTranscript) => {
    if (spokenTranscript) {
      setText(spokenTranscript)
    }
  })

  const isFinished = isCompleted || status === 'completed' || (typeof userTurnCount === 'number' && userTurnCount >= 3)
  const isInputDisabled = disabled || isAISpeaking || sending || isFinished

  // Automatically stop listening if AI starts speaking or component is disabled
  useEffect(() => {
    if ((isAISpeaking || isInputDisabled) && isListening) {
      stopListening()
    }
  }, [isAISpeaking, isInputDisabled, isListening, stopListening])

  const handleToggleMic = () => {
    if (isInputDisabled) return
    if (isListening) {
      stopListening()
    } else {
      resetTranscript()
      startListening()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isFinished || isInputDisabled) return
    if (isListening) {
      stopListening()
    }
    const trimmed = text.trim()
    if (!trimmed) return
    onSendMessage(trimmed)
    setText('')
    resetTranscript()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Dynamic placeholder guiding the user through the conversation flow
  const getPlaceholder = () => {
    if (isFinished) return t('conversation.placeholderFinished')
    if (audioStatus === 'loading') return t('conversation.placeholderVoiceLoading')
    if (audioStatus === 'playing') return t('conversation.placeholderSpeaking')
    if (sending) return t('conversation.placeholderThinking')
    if (isListening) return t('conversation.placeholderListening')
    return t('conversation.placeholderDefault')
  }

  const getMicTitle = () => {
    if (isFinished) return t('conversation.micFinished')
    if (isAISpeaking) return t('conversation.micSpeaking')
    if (isListening) return t('conversation.micListening')
    return t('conversation.micDefault')
  }

  return (
    <div className="ai-input-card">
      <form onSubmit={handleSubmit} className="ai-input-form">
        <input
          type="text"
          className="ai-input-field"
          placeholder={getPlaceholder()}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isInputDisabled}
        />

        {isMicSupported && (
          <button
            type="button"
            className={`ai-mic-btn ${isListening ? 'listening' : ''}`}
            onClick={handleToggleMic}
            disabled={isInputDisabled}
            title={getMicTitle()}
            aria-label={isListening ? t('conversation.micListening') : t('conversation.micDefault')}
          >
            {isListening ? '🔴' : '🎤'}
          </button>
        )}

        <button
          type="submit"
          className="ai-send-btn"
          disabled={isInputDisabled || !text.trim()}
          aria-label={t('conversation.send')}
        >
          {sending ? (
            <>
              <div className="ai-spinner-small" />
              <span>{t('conversation.sending')}</span>
            </>
          ) : (
            <>
              <span>{t('conversation.send')}</span>
              <span>➔</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default AIConversationInput

