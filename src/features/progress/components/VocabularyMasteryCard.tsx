import React from 'react'
import { useTranslation } from 'react-i18next'
import type { VocabularyProgress } from '../types/progressOverview'

export interface VocabularyMasteryCardProps {
  vocabulary: VocabularyProgress
}

export const VocabularyMasteryCard: React.FC<VocabularyMasteryCardProps> = ({ vocabulary }) => {
  const { t } = useTranslation('learning')
  // Safe total for visualization ratio between active states (mastered, learning, needReview)
  const activeSum = (vocabulary.mastered + vocabulary.learning + vocabulary.needReview) || 1
  const masteredPct = Math.round((vocabulary.mastered / activeSum) * 100)
  const learningPct = Math.round((vocabulary.learning / activeSum) * 100)
  const needReviewPct = Math.max(0, 100 - masteredPct - learningPct)

  return (
    <section className="po-card" aria-label={t('progress.vocabMasteryTitle')}>
      <div className="po-card-header">
        <div className="po-card-title-group">
          <div className="po-card-icon po-icon-green" aria-hidden="true">
            🧠
          </div>
          <div>
            <h2 className="po-card-title">{t('progress.vocabMasteryTitle')}</h2>
            <p className="po-card-subtitle">{t('progress.vocabMasterySubtitle')}</p>
          </div>
        </div>
      </div>

      <div className="po-vocab-grid">
        {/* 1. Learned */}
        <div className="po-vocab-item po-vocab-item--learned">
          <span className="po-vocab-item-label">{t('progress.totalLearned')}</span>
          <span className="po-vocab-item-value">{vocabulary.learned}</span>
          <span className="po-vocab-item-sub">{t('progress.wordsEncountered')}</span>
        </div>

        {/* 2. Mastered */}
        <div className="po-vocab-item po-vocab-item--mastered">
          <span className="po-vocab-item-label" style={{ color: '#047857' }}>{t('progress.mastered')}</span>
          <span className="po-vocab-item-value" style={{ color: '#047857' }}>{vocabulary.mastered}</span>
          <span className="po-vocab-item-sub">{t('progress.masteredDesc')}</span>
        </div>

        {/* 3. Learning */}
        <div className="po-vocab-item po-vocab-item--learning">
          <span className="po-vocab-item-label" style={{ color: '#1d4ed8' }}>{t('progress.learning')}</span>
          <span className="po-vocab-item-value" style={{ color: '#1d4ed8' }}>{vocabulary.learning}</span>
          <span className="po-vocab-item-sub">{t('progress.learningDesc')}</span>
        </div>

        {/* 4. Need Review */}
        <div className="po-vocab-item po-vocab-item--needReview">
          <span className="po-vocab-item-label" style={{ color: '#c2410c' }}>{t('progress.needReview')}</span>
          <span className="po-vocab-item-value" style={{ color: '#c2410c' }}>{vocabulary.needReview}</span>
          <span className="po-vocab-item-sub">{t('progress.needReviewDesc')}</span>
        </div>
      </div>

      {/* Segmented Visual Progress Bar */}
      <div
        className="po-vocab-segmented-bar"
        role="progressbar"
        aria-label={t('progress.vocabMasterySubtitle')}
        aria-valuenow={masteredPct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="po-vocab-seg po-vocab-seg--mastered"
          style={{ width: `${masteredPct}%` }}
          title={`${t('progress.mastered')}: ${vocabulary.mastered} (${masteredPct}%)`}
        />
        <div
          className="po-vocab-seg po-vocab-seg--learning"
          style={{ width: `${learningPct}%` }}
          title={`${t('progress.learning')}: ${vocabulary.learning} (${learningPct}%)`}
        />
        <div
          className="po-vocab-seg po-vocab-seg--needReview"
          style={{ width: `${needReviewPct}%` }}
          title={`${t('progress.needReview')}: ${vocabulary.needReview} (${needReviewPct}%)`}
        />
      </div>

      {/* Legend */}
      <div className="po-vocab-legend" aria-hidden="true">
        <div className="po-legend-item">
          <span className="po-legend-dot" style={{ backgroundColor: '#10b981' }}></span>
          <span>{t('progress.mastered')} ({vocabulary.mastered})</span>
        </div>
        <div className="po-legend-item">
          <span className="po-legend-dot" style={{ backgroundColor: '#3b82f6' }}></span>
          <span>{t('progress.learning')} ({vocabulary.learning})</span>
        </div>
        <div className="po-legend-item">
          <span className="po-legend-dot" style={{ backgroundColor: '#f97316' }}></span>
          <span>{t('progress.needReview')} ({vocabulary.needReview})</span>
        </div>
      </div>
    </section>
  )
}

export default VocabularyMasteryCard
