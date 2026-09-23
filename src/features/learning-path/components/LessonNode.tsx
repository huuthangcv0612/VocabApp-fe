import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { LearningPathLesson } from '../types/learningPath'

interface LessonNodeProps {
  lesson: LearningPathLesson
  index: number
  offsetPercent: number // Offset percentage for winding path alignment (-30 to +30)
}

const NODE_ICONS = ['⭐', '👑', '▶', '📖', '🎧', '📋']

export const LessonNode: React.FC<LessonNodeProps> = ({
  lesson,
  index,
  offsetPercent,
}) => {
  const { t } = useTranslation('learning')
  const navigate = useNavigate()
  const { _id, title, status, xp, estimated_minutes, description } = lesson

  const isCompleted = status === 'completed'
  const isCurrent = status === 'current'
  const isLocked = status === 'locked'

  const icon = NODE_ICONS[index % NODE_ICONS.length]

  const handleClick = () => {
    if (isLocked) return
    navigate(`/learn/lesson/${_id}`)
  }

  const statusLabel = isCompleted
    ? t('path.completed')
    : isCurrent
    ? t('path.current')
    : t('path.locked')

  return (
    <div
      className={`lp-node-wrapper status-${status}`}
      style={{
        transform: `translateX(${offsetPercent}px)`,
      }}
    >
      {/* Active Speech Bubble for Current Lesson */}
      {isCurrent && (
        <div className="lp-node-start-tooltip">
          <span className="lp-tooltip-text">{t('path.start')}</span>
          <div className="lp-tooltip-arrow" />
        </div>
      )}

      {/* Active Glow Ring for Current Lesson */}
      {isCurrent && <div className="lp-node-pulse" />}

      {/* Node Circle Button */}
      <button
        type="button"
        className={`lp-node-circle ${status}`}
        onClick={handleClick}
        disabled={isLocked}
        title={title}
        aria-label={`${title} (${statusLabel})`}
      >
        <div className="lp-node-inner">
          <span className="lp-node-icon">{icon}</span>
        </div>

        {/* Lock or Check status badge */}
        {isLocked && <span className="lp-node-lock-badge">🔒</span>}
        {isCompleted && <span className="lp-node-check-badge">✓</span>}
      </button>

      {/* Node Label Under Circle */}
      <div className="lp-node-sublabel" onClick={handleClick} style={{ cursor: isLocked ? 'default' : 'pointer' }}>
        <span className="lp-sublabel-step">{t('path.stepLabel')} {index + 1}</span>
        <h5 className="lp-sublabel-title">
          {title} {isCompleted && <span className="check-mark">✓</span>}
        </h5>
      </div>

      {/* Popover / Node Card Info */}
      <div className={`lp-node-card ${status}`}>
        <div className="lp-card-header">
          <span className="lp-card-tag">{t('path.stepLabel').toUpperCase()} {index + 1}</span>
          <span className="lp-card-xp">⚡ +{xp} XP</span>
        </div>
        <h4 className="lp-card-title">{title}</h4>
        {description && <p className="lp-card-desc">{description}</p>}
        <div className="lp-card-meta">
          <span className="lp-card-time">⏱️ {estimated_minutes} {t('path.minutes')}</span>
          <span className={`lp-card-status-badge ${status}`}>
            {isCompleted ? `✓ ${t('path.completed')}` : isCurrent ? t('path.startPractice') : `🔒 ${t('path.notUnlocked')}`}
          </span>
        </div>
      </div>
    </div>
  )
}

export default LessonNode
