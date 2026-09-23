import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ProgressLevel } from '../types/progressOverview'

export interface LevelProgressSectionProps {
  levels: ProgressLevel[]
}

export const LevelProgressSection: React.FC<LevelProgressSectionProps> = ({ levels }) => {
  const { t } = useTranslation('learning')
  const sortedLevels = useMemo(() => {
    return [...(levels || [])].sort((a, b) => (a.order || 0) - (b.order || 0))
  }, [levels])

  return (
    <section className="po-card" aria-label={t('progress.levelProgressTitle')}>
      <div className="po-card-header">
        <div className="po-card-title-group">
          <div className="po-card-icon po-icon-blue" aria-hidden="true">
            🗺️
          </div>
          <div>
            <h2 className="po-card-title">{t('progress.levelProgressTitle')}</h2>
            <p className="po-card-subtitle">{t('progress.levelProgressSubtitle')}</p>
          </div>
        </div>
      </div>

      {sortedLevels.length === 0 ? (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>
          {t('progress.noLevels')}
        </p>
      ) : (
        <div className="po-level-list">
          {sortedLevels.map((lvl) => {
            const isCompleted = lvl.completionPercentage >= 100

            return (
              <div
                key={lvl._id}
                className={`po-level-item ${lvl.isCurrent ? 'po-level-item--current' : ''}`}
              >
                <div className="po-level-header">
                  <div className="po-level-title-group">
                    <span className="po-level-name">{lvl.level_name}</span>
                    {lvl.isCurrent && (
                      <span className="po-level-badge" title={t('progress.studying')}>
                        {t('progress.studying')}
                      </span>
                    )}
                    {isCompleted && (
                      <span
                        className="po-level-badge"
                        style={{ backgroundColor: '#10b981' }}
                        title={t('progress.completedBadge')}
                      >
                        {t('progress.completedBadge')}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="po-level-count">
                      {t('progress.lessonsCountLabel', { completed: lvl.completedLessons, total: lvl.totalLessons })}
                    </span>
                    <span className="po-level-pct">{lvl.completionPercentage}%</span>
                  </div>
                </div>

                <div
                  className="po-level-bar"
                  role="progressbar"
                  aria-label={`${t('progress.levelProgress')} ${lvl.level_name}`}
                  aria-valuenow={lvl.completionPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={`po-level-bar-fill ${isCompleted ? 'po-level-bar-fill--complete' : ''}`}
                    style={{ width: `${Math.min(100, Math.max(0, lvl.completionPercentage))}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default LevelProgressSection
