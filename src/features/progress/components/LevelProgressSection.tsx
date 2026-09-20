import React, { useMemo } from 'react'
import type { ProgressLevel } from '../types/progressOverview'

export interface LevelProgressSectionProps {
  levels: ProgressLevel[]
}

export const LevelProgressSection: React.FC<LevelProgressSectionProps> = ({ levels }) => {
  const sortedLevels = useMemo(() => {
    return [...(levels || [])].sort((a, b) => (a.order || 0) - (b.order || 0))
  }, [levels])

  return (
    <section className="po-card" aria-label="Tiến độ theo từng trình độ">
      <div className="po-card-header">
        <div className="po-card-title-group">
          <div className="po-card-icon po-icon-blue" aria-hidden="true">
            🗺️
          </div>
          <div>
            <h2 className="po-card-title">TIẾN ĐỘ THEO CẤP ĐỘ</h2>
            <p className="po-card-subtitle">Chi tiết mức độ hoàn thành từ A1 đến các cấp độ cao hơn</p>
          </div>
        </div>
      </div>

      {sortedLevels.length === 0 ? (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>
          Chưa có thông tin cấp độ học.
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
                      <span className="po-level-badge" title="Cấp độ hiện tại của bạn">
                        ⭐ Đang học
                      </span>
                    )}
                    {isCompleted && (
                      <span
                        className="po-level-badge"
                        style={{ backgroundColor: '#10b981' }}
                        title="Đã hoàn thành cấp độ này"
                      >
                        ✓ Hoàn thành
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="po-level-count">
                      {lvl.completedLessons}/{lvl.totalLessons} bài học
                    </span>
                    <span className="po-level-pct">{lvl.completionPercentage}%</span>
                  </div>
                </div>

                <div
                  className="po-level-bar"
                  role="progressbar"
                  aria-label={`Tiến độ hoàn thành trình độ ${lvl.level_name}`}
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
