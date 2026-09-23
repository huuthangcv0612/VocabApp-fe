import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import CloudIcon from '../../../assets/Cloud.svg'
import type { CurrentLevel } from '../types/progressOverview'

export interface ProgressHeaderBannerProps {
  currentLevel?: CurrentLevel
  levelCompletionPercentage?: number
  streak?: number
}

export const ProgressHeaderBanner: React.FC<ProgressHeaderBannerProps> = ({
  currentLevel,
  levelCompletionPercentage = 0,
  streak = 0,
}) => {
  const { t } = useTranslation('learning')
  return (
    <section className="progress-hero-section" aria-label={t('progress.heroTitle')}>
      <img src={CloudIcon} alt="" className="hero-cloud cloud-1" aria-hidden="true" />
      <img src={CloudIcon} alt="" className="hero-cloud cloud-2" aria-hidden="true" />

      <div className="progress-hero-container">
        <div className="progress-hero-content">
          <Link to="/learning-path" className="back-link">
            {t('progress.backToPath')}
          </Link>

          <h1 className="progress-hero-title">{t('progress.heroTitle')}</h1>
          <p className="progress-hero-subtitle">
            {t('progress.heroSubtitle')}
          </p>

          <div className="po-hero-badges">
            {streak > 0 && (
              <span className="po-hero-badge po-hero-badge--streak" title={t('progress.streak')}>
                🔥 {t('progress.streakDaysCount', { count: streak })}
              </span>
            )}

            {currentLevel && (
              <span className="po-hero-badge po-hero-badge--level" title={t('progress.currentLevel')}>
                🎓 {t('progress.currentLevelBadge', { level: currentLevel.level_name })}
              </span>
            )}

            <span className="po-hero-badge po-hero-badge--progress" title={t('progress.levelProgress')}>
              🎯 {t('progress.completedPercent', { percent: levelCompletionPercentage })}
            </span>
          </div>
        </div>
      </div>

      <div className="progress-hero-wave" aria-hidden="true"></div>
    </section>
  )
}

export default ProgressHeaderBanner
