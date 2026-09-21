import React, { useState, useEffect } from 'react'
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
    if (isFinished) return 'Diese Unterhaltung ist bereits beendet (3/3 Antworten).'
    if (audioStatus === 'loading') return 'AI đang chuẩn bị giọng nói...'
    if (audioStatus === 'playing') return 'AI đang nói, hãy chú ý lắng nghe...'
    if (sending) return 'AI đang suy nghĩ...'
    if (isListening) return 'Đang nghe bạn nói tiếng Đức...'
    return 'Schreibe deine Antwort...'
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
            title={
              isFinished
                ? 'Hội thoại đã kết thúc'
                : isAISpeaking
                ? 'AI đang nói, vui lòng lắng nghe...'
                : isListening
                ? 'Dừng ghi âm'
                : 'Nói bằng tiếng Đức (Microphone)'
            }
            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
          >
            {isListening ? '🔴' : '🎤'}
          </button>
        )}

        <button
          type="submit"
          className="ai-send-btn"
          disabled={isInputDisabled || !text.trim()}
          aria-label="Send message"
        >
          {sending ? (
            <>
              <div className="ai-spinner-small" />
              <span>Đang gửi...</span>
            </>
          ) : (
            <>
              <span>Antworten</span>
              <span>➔</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}


export default AIConversationInput

