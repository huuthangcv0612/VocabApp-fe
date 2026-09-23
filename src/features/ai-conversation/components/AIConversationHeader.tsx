import React from 'react'
import { useTranslation } from 'react-i18next'
import type { AILesson } from '../types/aiConversation'

interface AIConversationHeaderProps {
  lesson: AILesson
  turnCount?: number
  userTurnCount?: number
  maxTurns?: number
  onComplete?: () => void
  onExit?: () => void
  isCompleting?: boolean
  status?: string
  isCompleted?: boolean
}

export const AIConversationHeader: React.FC<AIConversationHeaderProps> = ({
  lesson,
  turnCount = 0,
  userTurnCount,
  maxTurns = 3,
  onComplete,
  onExit,
  isCompleting = false,
  status = 'active',
  isCompleted = false,
}) => {
  const { t } = useTranslation('ai')
  const effectiveTurnCount = typeof userTurnCount === 'number'
    ? userTurnCount
    : Math.min(turnCount, maxTurns)

  return (
    <div className="ai-header-card">
      <div className="ai-header-info">
        {lesson.level && <span className="ai-header-level">{lesson.level}</span>}
        <h2 className="ai-header-title">{lesson.title}</h2>
      </div>

      <div className="ai-header-progress">
        <div
          className="ai-turn-progress-wrapper"
          title={`${t('conversation.answers')} ${effectiveTurnCount}/${maxTurns}`}
        >
          <span className="ai-turn-badge">
            <span className="ai-turn-label">{t('conversation.answers')} </span>
            <span className="ai-turn-numbers">
              <strong>{effectiveTurnCount}</strong> / {maxTurns}
            </span>
          </span>
          <div className="ai-turn-dots" aria-label={`${t('conversation.answers')} ${effectiveTurnCount} / ${maxTurns}`}>
            {Array.from({ length: maxTurns }).map((_, idx) => (
              <span
                key={idx}
                className={`ai-turn-dot ${idx < effectiveTurnCount ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>

        {status === 'active' && !isCompleted && effectiveTurnCount < maxTurns && onComplete && (
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
            {isCompleting ? t('conversation.completing') : t('conversation.completeBtn')}
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
            aria-label={t('conversation.exitBtn')}
          >
            {t('conversation.exitBtn')}
          </button>
        )}
      </div>
    </div>
  )
}

export default AIConversationHeader
