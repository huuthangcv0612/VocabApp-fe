import React from 'react'
import type { ActivityEntry } from '../types/progressOverview'

export interface ActivityHistoryCardProps {
  activity: ActivityEntry[]
}

const formatDateString = (rawDate: string): string => {
  try {
    const d = new Date(rawDate)
    if (isNaN(d.getTime())) return rawDate
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return rawDate
  }
}

export const ActivityHistoryCard: React.FC<ActivityHistoryCardProps> = ({ activity }) => {
  return (
    <section className="po-card" aria-label="Lịch sử hoạt động học tập">
      <div className="po-card-header">
        <div className="po-card-title-group">
          <div className="po-card-icon po-icon-purple" aria-hidden="true">
            📅
          </div>
          <div>
            <h2 className="po-card-title">NHẬT KÝ HOẠT ĐỘNG</h2>
            <p className="po-card-subtitle">Lịch sử hoàn thành bài học và luyện tập</p>
          </div>
        </div>
      </div>

      {!activity || activity.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>
          <p style={{ margin: 0, fontSize: '0.92rem' }}>
            Chưa có hoạt động học tập nào được ghi nhận gần đây.
          </p>
          <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
            Hãy hoàn thành bài học đầu tiên để kích hoạt nhật ký!
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
                  title="Số câu bài tập hoàn thành trong ngày"
                >
                  ✏️ {item.exercisesCount} bài tập
                </span>
                <span
                  className="po-activity-tag po-activity-tag--lessons"
                  title="Số bài học hoàn thành trong ngày"
                >
                  🎓 {item.lessonsCompleted} bài học
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
