import React from 'react'
import type { AILesson } from '../types/aiConversation'

interface AIConversationHeaderProps {
  lesson: AILesson
  turnCount: number
  maxTurns?: number
  onComplete?: () => void
  onExit?: () => void
  isCompleting?: boolean
  status?: string
}

export const AIConversationHeader: React.FC<AIConversationHeaderProps> = ({
  lesson,
  turnCount,
  maxTurns = 10,
  onComplete,
  onExit,
  isCompleting = false,
  status = 'active',
}) => {
  return (
    <div className="ai-header-card">
      <div className="ai-header-info">
        {lesson.level && <span className="ai-header-level">{lesson.level}</span>}
        <h2 className="ai-header-title">{lesson.title}</h2>
      </div>

      <div className="ai-header-progress">
        <span className="ai-turn-badge">
          Turn {turnCount} / {maxTurns}
        </span>

        {status === 'active' && onComplete && (
          <button
            onClick={onComplete}
            disabled={isCompleting}
            className="btn-admin-secondary"
            style={{
              fontSize: '0.82rem',
              padding: '6px 14px',
              borderRadius: '9999px',
              cursor: isCompleting ? 'not-allowed' : 'pointer',
              fontWeight: 600,
            }}
          >
            {isCompleting ? 'Đang hoàn thành...' : 'Hoàn thành 🏁'}
          </button>
        )}

        {onExit && (
          <button
            onClick={onExit}
            className="btn-admin-secondary"
            style={{
              fontSize: '0.82rem',
              padding: '6px 14px',
              borderRadius: '9999px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Thoát ✕
          </button>
        )}
      </div>
    </div>
  )
}

export default AIConversationHeader
