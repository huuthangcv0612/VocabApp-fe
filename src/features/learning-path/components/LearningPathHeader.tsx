import React from 'react'
import { useTranslation } from 'react-i18next'
import type { LearningPathLevel } from '../types/learningPath'

interface LearningPathHeaderProps {
  levels: LearningPathLevel[]
  activeLevel: LearningPathLevel | null
  selectedLevelId: string
  onSelectLevel: (levelId: string) => void
}

export const LearningPathHeader: React.FC<LearningPathHeaderProps> = ({
  levels,
  activeLevel,
  selectedLevelId,
  onSelectLevel,
}) => {
  const { t } = useTranslation('learning')
  if (!activeLevel) return null

  const {
    level_name,
    description,
    completedLessonsCount,
    totalLessonsCount,
    progressPercentage,
  } = activeLevel

  return (
    <header className="lp-header">
      {/* Level Selector Tabs */}
      <div className="lp-header-top">
        <div className="lp-level-tabs">
          {levels.map((lvl) => {
            const isActive = lvl._id === selectedLevelId
            return (
              <button
                key={lvl._id}
                type="button"
                className={`lp-level-tab ${isActive ? 'active' : ''}`}
                onClick={() => onSelectLevel(lvl._id)}
              >
                <span className="lp-tab-name">{t('path.levelTag')} {lvl.level_name}</span>
                {lvl.progressPercentage > 0 && (
                  <span className="lp-tab-pct">{lvl.progressPercentage}%</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Emerald Hero Banner Card matching Reference UI */}
      <div className="lp-header-card">
        <div className="lp-header-banner-left">
          <div className="lp-banner-avatar">
            <span className="lp-avatar-emoji">👧</span>
          </div>
          <div className="lp-banner-info">
            <div className="lp-level-tag">{t('path.levelTag')} {level_name}</div>
            <h1 className="lp-header-title">
              {t('path.journeyTitle')} <span className="highlight">{t('path.germanLevel')} {level_name}</span>
            </h1>
            <p className="lp-header-desc">
              {description || t('path.descFallback', { level: level_name })}
            </p>
          </div>
        </div>

        {/* Right side progress box */}
        <div className="lp-header-progress-box">
          <div className="lp-progress-box-top">
            <span className="lp-progress-label">{t('path.sectionProgress')}</span>
            <span className="lp-progress-icon">📋</span>
          </div>
          <div className="lp-progress-track">
            <div
              className="lp-progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="lp-progress-val-sub">
            {completedLessonsCount} / {totalLessonsCount} {t('path.lessonsCompleted')} ({progressPercentage}%)
          </div>
        </div>
      </div>
    </header>
  )
}

export default LearningPathHeader
