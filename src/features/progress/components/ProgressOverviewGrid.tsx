import React from 'react'
import { useTranslation } from 'react-i18next'
import type { ProgressOverview } from '../types/progressOverview'

export interface ProgressOverviewGridProps {
  overview: ProgressOverview
}

export const ProgressOverviewGrid: React.FC<ProgressOverviewGridProps> = ({ overview }) => {
  const { t } = useTranslation('learning')

  return (
    <section className="po-metrics-grid" aria-label={t('progress.statsTitle')}>
      {/* 1. Current Level */}
      <div className="po-metric-card">
        <div className="po-metric-header">
          <div className="po-metric-icon po-icon-blue" aria-hidden="true">
            🎓
          </div>
          <span className="po-metric-label">{t('progress.currentLevel')}</span>
        </div>
        <div className="po-metric-value-row">
          <span className="po-metric-value">{overview.currentLevel?.level_name || 'N/A'}</span>
        </div>
        <p className="po-metric-sub">{t('progress.levelOrder', { order: overview.currentLevel?.order || 1 })}</p>
      </div>

      {/* 2. Level Completion Percentage */}
      <div className="po-metric-card">
        <div className="po-metric-header">
          <div className="po-metric-icon po-icon-green" aria-hidden="true">
            🎯
          </div>
          <span className="po-metric-label">{t('progress.levelProgress')}</span>
        </div>
        <div className="po-metric-value-row">
          <span className="po-metric-value">{overview.levelCompletionPercentage}%</span>
        </div>
        <div
          className="po-metric-bar"
          role="progressbar"
          aria-label={`${t('progress.levelProgress')} ${overview.currentLevel?.level_name || ''}`}
          aria-valuenow={overview.levelCompletionPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="po-metric-bar-fill"
            style={{ width: `${Math.min(100, Math.max(0, overview.levelCompletionPercentage))}%` }}
          />
        </div>
      </div>

      {/* 3. Lessons Completed */}
      <div className="po-metric-card">
        <div className="po-metric-header">
          <div className="po-metric-icon po-icon-orange" aria-hidden="true">
            📚
          </div>
          <span className="po-metric-label">{t('progress.lessonsCompleted')}</span>
        </div>
        <div className="po-metric-value-row">
          <span className="po-metric-value">{overview.lessonsCompleted}</span>
          <span className="po-metric-total">{t('progress.totalLessonsCount', { total: overview.totalLessons })}</span>
        </div>
        <p className="po-metric-sub">{t('progress.lessonsCompletedDesc')}</p>
      </div>

      {/* 4. Total XP */}
      <div className="po-metric-card">
        <div className="po-metric-header">
          <div className="po-metric-icon po-icon-yellow" aria-hidden="true">
            ⚡
          </div>
          <span className="po-metric-label">{t('progress.totalXp')}</span>
        </div>
        <div className="po-metric-value-row">
          <span className="po-metric-value">{overview.totalXp}</span>
          <span className="po-metric-total">{t('progress.xpTotal')}</span>
        </div>
        <p className="po-metric-sub">{t('progress.totalXpDesc')}</p>
      </div>

      {/* 5. Streak */}
      <div className="po-metric-card">
        <div className="po-metric-header">
          <div className="po-metric-icon po-icon-red" aria-hidden="true">
            🔥
          </div>
          <span className="po-metric-label">{t('progress.streak')}</span>
        </div>
        <div className="po-metric-value-row">
          <span className="po-metric-value">{overview.streak}</span>
          <span className="po-metric-total">{t('progress.streakDays')}</span>
        </div>
        <p className="po-metric-sub">
          {overview.streak > 0 ? t('progress.streakGreat') : t('progress.streakStart')}
        </p>
      </div>

      {/* 6. Estimated Study Time */}
      <div className="po-metric-card">
        <div className="po-metric-header">
          <div className="po-metric-icon po-icon-purple" aria-hidden="true">
            ⏱️
          </div>
          <span className="po-metric-label">{t('progress.studyTime')}</span>
        </div>
        <div className="po-metric-value-row">
          <span className="po-metric-value">{overview.estimatedStudyMinutes}</span>
          <span className="po-metric-total">{t('progress.minutes')}</span>
        </div>
        <p className="po-metric-sub">{t('progress.studyTimeDesc')}</p>
      </div>
    </section>
  )
}

export default ProgressOverviewGrid
