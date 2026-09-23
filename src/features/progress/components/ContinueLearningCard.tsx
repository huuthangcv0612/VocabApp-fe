import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ContinueLearning } from '../types/progressOverview'

export interface ContinueLearningCardProps {
  continueLearning: ContinueLearning | null
}

export const ContinueLearningCard: React.FC<ContinueLearningCardProps> = ({ continueLearning }) => {
  const { t } = useTranslation('learning')
  const navigate = useNavigate()

  if (!continueLearning) {
    return (
      <section className="po-card po-completed-card" aria-label={t('progress.allCompletedTitle')}>
        <div className="po-completed-icon" aria-hidden="true">
          🌟
        </div>
        <h2 className="po-completed-title">{t('progress.allCompletedTitle')}</h2>
        <p className="po-completed-desc">
          {t('progress.allCompletedDesc')}
        </p>
        <button
          type="button"
          onClick={() => navigate('/learning-path')}
          className="po-continue-btn"
          aria-label={t('progress.explorePathBtn')}
        >
          {t('progress.explorePathBtn')}
        </button>
      </section>
    )
  }

  const handleContinue = () => {
    navigate(`/learn/lesson/${continueLearning.lessonId}`)
  }

  const isStarted = continueLearning.status === 'in_progress'

  return (
    <section className="po-card po-continue-card" aria-label={t('progress.continueTitle')}>
      <div className="po-card-header">
        <div className="po-card-title-group">
          <div className="po-card-icon po-icon-orange" aria-hidden="true">
            📖
          </div>
          <div>
            <h2 className="po-card-title">{t('progress.continueTitle')}</h2>
            <p className="po-card-subtitle">{t('progress.continueSubtitle')}</p>
          </div>
        </div>

        <span
          className={`po-continue-badge po-continue-badge--${continueLearning.status}`}
          title={isStarted ? t('progress.inProgressBadge') : t('progress.newLessonBadge')}
        >
          {isStarted ? t('progress.inProgressBadge') : t('progress.newLessonBadge')}
        </span>
      </div>

      <div className="po-continue-content">
        <h3 className="po-continue-lesson-title">{continueLearning.lessonTitle}</h3>

        <div className="po-continue-breadcrumbs">
          {continueLearning.levelName && (
            <span className="po-breadcrumb-chip">
              🎓 {continueLearning.levelName}
            </span>
          )}
          {continueLearning.topicTitle && (
            <span className="po-breadcrumb-chip">
              🏷️ {continueLearning.topicTitle}
            </span>
          )}
          {continueLearning.unitTitle && (
            <span className="po-breadcrumb-chip">
              📂 {continueLearning.unitTitle}
            </span>
          )}
        </div>

        <div className="po-continue-progress-row">
          <span>{t('progress.lessonProgress')}</span>
          <span>{continueLearning.progress}%</span>
        </div>

        <div
          className="po-continue-bar"
          role="progressbar"
          aria-label={`${t('progress.lessonProgress')} ${continueLearning.lessonTitle}`}
          aria-valuenow={continueLearning.progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="po-continue-bar-fill"
            style={{ width: `${Math.min(100, Math.max(0, continueLearning.progress))}%` }}
          />
        </div>

        <button
          type="button"
          onClick={handleContinue}
          className="po-continue-btn"
          aria-label={isStarted ? t('progress.continueNowBtn') : t('progress.startNowBtn')}
        >
          {isStarted ? t('progress.continueNowBtn') : t('progress.startNowBtn')}
        </button>
      </div>
    </section>
  )
}

export default ContinueLearningCard
