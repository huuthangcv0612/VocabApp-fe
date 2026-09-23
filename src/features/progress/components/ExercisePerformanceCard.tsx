import React from 'react'
import { useTranslation } from 'react-i18next'
import type { ExercisePerformance } from '../types/progressOverview'

export interface ExercisePerformanceCardProps {
  exercisePerformance: ExercisePerformance
}

export const ExercisePerformanceCard: React.FC<ExercisePerformanceCardProps> = ({ exercisePerformance }) => {
  const { t } = useTranslation('learning')
  const typesEntries = Object.entries(exercisePerformance.byType || {})

  const getExerciseTypeName = (rawType: string): string => {
    switch (rawType) {
      case 'multiple_choice':
        return t('progress.typeMultipleChoice')
      case 'listening':
        return t('progress.typeListening')
      case 'matching':
        return t('progress.typeMatching')
      case 'fill_blank':
      case 'fill_in_blank':
        return t('progress.typeFillBlank')
      case 'sentence_arrangement':
        return t('progress.typeSentenceArrangement')
      case 'word_arrangement':
        return t('progress.typeWordArrangement')
      case 'translation':
        return t('progress.typeTranslation')
      default:
        return rawType
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
    }
  }

  return (
    <section className="po-card" aria-label={t('progress.performanceTitle')}>
      <div className="po-card-header">
        <div className="po-card-title-group">
          <div className="po-card-icon po-icon-yellow" aria-hidden="true">
            🎯
          </div>
          <div>
            <h2 className="po-card-title">{t('progress.performanceTitle')}</h2>
            <p className="po-card-subtitle">{t('progress.accuracyOverall')}</p>
          </div>
        </div>
      </div>

      {/* Summary Row */}
      <div className="po-perf-summary">
        <div className="po-perf-metric">
          <div className="po-perf-metric-val po-perf-metric-val--accuracy">
            {exercisePerformance.overallAccuracy}%
          </div>
          <div className="po-perf-metric-label">{t('progress.accuracyOverall')}</div>
        </div>

        <div className="po-perf-metric">
          <div className="po-perf-metric-val">
            {exercisePerformance.totalCorrect}
          </div>
          <div className="po-perf-metric-label">{t('progress.correctAnswers')}</div>
        </div>

        <div className="po-perf-metric">
          <div className="po-perf-metric-val">
            {exercisePerformance.totalAttempted}
          </div>
          <div className="po-perf-metric-label">{t('progress.totalAttempts')}</div>
        </div>
      </div>

      {/* Breakdown by Exercise Type */}
      {typesEntries.length === 0 ? (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '16px 0', fontSize: '0.9rem' }}>
          {t('progress.noExerciseData')}
        </p>
      ) : (
        <div className="po-perf-types">
          {typesEntries.map(([typeKey, perf]) => {
            const displayName = getExerciseTypeName(typeKey)

            return (
              <div key={typeKey} className="po-perf-type-item">
                <div className="po-perf-type-header">
                  <span className="po-perf-type-name">{displayName}</span>
                  <div className="po-perf-type-stats">
                    <span className="po-perf-type-count">
                      {t('progress.correctCount', { correct: perf.correct, total: perf.total })}
                    </span>
                    <span className="po-perf-type-pct">{perf.accuracy}%</span>
                  </div>
                </div>

                <div
                  className="po-perf-type-bar"
                  role="progressbar"
                  aria-label={`${displayName}: ${perf.accuracy}%`}
                  aria-valuenow={perf.accuracy}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="po-perf-type-bar-fill"
                    style={{ width: `${Math.min(100, Math.max(0, perf.accuracy))}%` }}
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

export default ExercisePerformanceCard
