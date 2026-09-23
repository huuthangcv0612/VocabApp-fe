import React from 'react'
import { useTranslation } from 'react-i18next'

interface LearningPathSidebarProps {
  completedLessonsCount: number
  totalLessonsCount: number
  progressPercentage: number
  totalXp: number
}

export const LearningPathSidebar: React.FC<LearningPathSidebarProps> = ({
  completedLessonsCount,
  totalLessonsCount,
  progressPercentage,
  totalXp,
}) => {
  const { t } = useTranslation('learning')
  // Compute daily goal metric dynamically (e.g. 3 out of 5)
  const dailyTarget = 5
  const dailyCurrent = Math.min(completedLessonsCount, dailyTarget)
  const dailyPct = Math.round((dailyCurrent / dailyTarget) * 100)

  return (
    <aside className="lp-sidebar">
      {/* CARD 1: Daily Goal */}
      <div className="lp-sidebar-card lp-card-daily-goal">
        <div className="lp-sidebar-card-header">
          <div className="lp-card-header-title">
            <span className="lp-header-icon">🎯</span>
            <h4>{t('path.dailyGoal')}</h4>
          </div>
          <span className="lp-header-link">{t('path.viewDetail')}</span>
        </div>

        <div className="lp-goal-body">
          {/* Circular Progress Ring */}
          <div className="lp-ring-chart" style={{ '--ring-pct': `${dailyPct}%` } as React.CSSProperties}>
            <div className="lp-ring-inner">
              <span className="lp-ring-num">{dailyCurrent}</span>
              <span className="lp-ring-denom">/{dailyTarget}</span>
            </div>
          </div>

          <div className="lp-goal-info">
            <h5 className="lp-goal-title">{t('path.completeDaily', { count: dailyTarget })}</h5>
            <p className="lp-goal-desc">{t('path.toEarnBonus', { xp: 50 })}</p>
          </div>
        </div>

        {/* Daily Reward Chest Box */}
        <div className="lp-reward-box">
          <div className="lp-reward-left">
            <span className="lp-reward-icon">🎁</span>
            <div>
              <span className="lp-reward-label">{t('path.rewardToday')}</span>
              <span className="lp-reward-val">+50 XP</span>
            </div>
          </div>
          <span className="lp-reward-check">✓</span>
        </div>
      </div>

      {/* CARD 2: Progress Statistics */}
      <div className="lp-sidebar-card lp-card-stats">
        <div className="lp-sidebar-card-header">
          <div className="lp-card-header-title">
            <span className="lp-header-icon">📊</span>
            <h4>{t('path.statsTitle')}</h4>
          </div>
        </div>

        <div className="lp-stats-list">
          <div className="lp-stat-row">
            <div className="lp-stat-label-group">
              <span className="lp-stat-icon">⚡</span>
              <span>{t('path.totalLessons')}</span>
            </div>
            <span className="lp-stat-value">{completedLessonsCount} / {totalLessonsCount}</span>
          </div>

          <div className="lp-stat-row">
            <div className="lp-stat-label-group">
              <span className="lp-stat-icon">🛡️</span>
              <span>{t('path.totalXp')}</span>
            </div>
            <span className="lp-stat-value">{totalXp} XP</span>
          </div>

          <div className="lp-stat-row vertical">
            <div className="lp-stat-row-top">
              <div className="lp-stat-label-group">
                <span className="lp-stat-icon">❤️</span>
                <span>{t('path.completionRate')}</span>
              </div>
              <span className="lp-stat-value">{progressPercentage}%</span>
            </div>
            <div className="lp-stat-progress-track">
              <div className="lp-stat-progress-fill" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* CARD 3: Mascot Motivation Card */}
      <div className="lp-sidebar-card lp-card-mascot">
        <div className="lp-mascot-content">
          <div className="lp-mascot-avatar">
            <span className="lp-mascot-emoji">🦜</span>
          </div>
          <div className="lp-mascot-text">
            <h5 className="lp-mascot-title">{t('path.cheerTitle')}</h5>
            <p className="lp-mascot-desc">
              {t('path.cheerDesc')}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default LearningPathSidebar
