import React from 'react'
import { useTranslation } from 'react-i18next'
import type { ActivityEntry } from '../types/progressOverview'

export interface ActivityHistoryCardProps {
  activity: ActivityEntry[]
}

export const ActivityHistoryCard: React.FC<ActivityHistoryCardProps> = ({ activity }) => {
  const { t, i18n } = useTranslation('learning')

  const formatDateString = (rawDate: string): string => {
    try {
      const d = new Date(rawDate)
      if (isNaN(d.getTime())) return rawDate
      const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN'
      return d.toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return rawDate
    }
  }

  return (
    <section className="po-card" aria-label={t('progress.activityLogTitle')}>
      <div className="po-card-header">
        <div className="po-card-title-group">
          <div className="po-card-icon po-icon-purple" aria-hidden="true">
            📅
          </div>
          <div>
            <h2 className="po-card-title">{t('progress.activityLogTitle')}</h2>
            <p className="po-card-subtitle">{t('progress.activityLogSubtitle')}</p>
          </div>
        </div>
      </div>

      {!activity || activity.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>
          <p style={{ margin: 0, fontSize: '0.92rem' }}>
            {t('progress.noActivity')}
          </p>
          <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
            {t('progress.noActivitySub')}
          </span>
        </div>
      ) : (
        <div className="po-activity-list">
          {activity.map((item, idx) => (
            <div key={`${item.date}-${idx}`} className="po-activity-item">
              <div className="po-activity-date-group">
                <span className="po-activity-date-icon" aria-hidden="true">
                  📆
                </span>
                <span className="po-activity-date">{formatDateString(item.date)}</span>
              </div>

              <div className="po-activity-stats">
                <span
                  className="po-activity-tag po-activity-tag--exercises"
                  title={t('progress.exercisesCountTag', { count: item.exercisesCount })}
                >
                  {t('progress.exercisesCountTag', { count: item.exercisesCount })}
                </span>
                <span
                  className="po-activity-tag po-activity-tag--lessons"
                  title={t('progress.lessonsCountTag', { count: item.lessonsCompleted })}
                >
                  {t('progress.lessonsCountTag', { count: item.lessonsCompleted })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default ActivityHistoryCard
