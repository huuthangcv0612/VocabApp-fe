import React from 'react'
import type { ProgressOverview } from '../types/progressOverview'

export interface ProgressOverviewGridProps {
  overview: ProgressOverview
}

export const ProgressOverviewGrid: React.FC<ProgressOverviewGridProps> = ({ overview }) => {
  return (
    <section className="po-metrics-grid" aria-label="Các chỉ số tổng quan">
      {/* 1. Current Level */}
      <div className="po-metric-card">
        <div className="po-metric-header">
          <div className="po-metric-icon po-icon-blue" aria-hidden="true">
            🎓
          </div>
          <span className="po-metric-label">Trình độ hiện tại</span>
        </div>
        <div className="po-metric-value-row">
          <span className="po-metric-value">{overview.currentLevel?.level_name || 'N/A'}</span>
        </div>
        <p className="po-metric-sub">Thứ tự cấp độ: #{overview.currentLevel?.order || 1}</p>
      </div>

      {/* 2. Level Completion Percentage */}
      <div className="po-metric-card">
        <div className="po-metric-header">
          <div className="po-metric-icon po-icon-green" aria-hidden="true">
            🎯
          </div>
          <span className="po-metric-label">Tiến độ trình độ</span>
        </div>
        <div className="po-metric-value-row">
          <span className="po-metric-value">{overview.levelCompletionPercentage}%</span>
        </div>
        <div
          className="po-metric-bar"
          role="progressbar"
          aria-label={`Tiến độ hoàn thành trình độ ${overview.currentLevel?.level_name || ''}`}
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
          <span className="po-metric-label">Bài học đã xong</span>
        </div>
        <div className="po-metric-value-row">
          <span className="po-metric-value">{overview.lessonsCompleted}</span>
          <span className="po-metric-total">/ {overview.totalLessons} bài</span>
        </div>
        <p className="po-metric-sub">Đã hoàn tất tất cả dạng bài tập</p>
      </div>

      {/* 4. Total XP */}
      <div className="po-metric-card">
        <div className="po-metric-header">
          <div className="po-metric-icon po-icon-yellow" aria-hidden="true">
            ⚡
          </div>
          <span className="po-metric-label">Tổng điểm thưởng XP</span>
        </div>
        <div className="po-metric-value-row">
          <span className="po-metric-value">{overview.totalXp}</span>
          <span className="po-metric-total">XP</span>
        </div>
        <p className="po-metric-sub">Tích lũy qua các bài học & bài tập</p>
      </div>

      {/* 5. Streak */}
      <div className="po-metric-card">
        <div className="po-metric-header">
          <div className="po-metric-icon po-icon-red" aria-hidden="true">
            🔥
          </div>
          <span className="po-metric-label">Chuỗi ngày Streak</span>
        </div>
        <div className="po-metric-value-row">
          <span className="po-metric-value">{overview.streak}</span>
          <span className="po-metric-total">ngày</span>
        </div>
        <p className="po-metric-sub">
          {overview.streak > 0 ? 'Phong độ rất tốt! Giữ vững nhé!' : 'Hãy học một bài để bắt đầu chuỗi streak!'}
        </p>
      </div>

      {/* 6. Estimated Study Time */}
      <div className="po-metric-card">
        <div className="po-metric-header">
          <div className="po-metric-icon po-icon-purple" aria-hidden="true">
            ⏱️
          </div>
          <span className="po-metric-label">Thời gian học tập</span>
        </div>
        <div className="po-metric-value-row">
          <span className="po-metric-value">{overview.estimatedStudyMinutes}</span>
          <span className="po-metric-total">phút</span>
        </div>
        <p className="po-metric-sub">Thời gian học tập ước tính tích lũy</p>
      </div>
    </section>
  )
}

export default ProgressOverviewGrid
