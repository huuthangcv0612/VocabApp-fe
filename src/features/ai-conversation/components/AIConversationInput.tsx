import React, { useState } from 'react'

interface AIConversationInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
  sending?: boolean
  status?: string
}

export const AIConversationInput: React.FC<AIConversationInputProps> = ({
  onSendMessage,
  disabled = false,
  sending = false,
  status = 'active',
}) => {
  const [text, setText] = useState('')

  const isCompleted = status === 'completed'
  const isInputDisabled = disabled || sending || isCompleted

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || isInputDisabled) return
    onSendMessage(trimmed)
    setText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="ai-input-card">
      <form onSubmit={handleSubmit} className="ai-input-form">
        <input
          type="text"
          className="ai-input-field"
          placeholder={
            isCompleted
              ? 'Hội thoại đã hoàn thành.'
              : sending
              ? 'AI đang trả lời...'
              : 'Schreibe deine Antwort...'
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isInputDisabled}
        />
        <button
          type="submit"
          className="ai-send-btn"
          disabled={isInputDisabled || !text.trim()}
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
