import React from 'react'

export const ProgressSkeleton: React.FC = () => {
  return (
    <div className="po-container" aria-label="Đang tải dữ liệu tiến độ học tập..." aria-busy="true">
      <div className="po-main-layout">
        {/* Skeleton for 6 Metrics */}
        <div className="po-skeleton-metrics">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="po-skeleton-box po-skeleton-card" />
          ))}
        </div>

        {/* Skeleton for Continue Learning Card */}
        <div className="po-skeleton-box" style={{ height: '180px', borderRadius: '24px' }} />

        {/* Skeleton for 2-column sections */}
        <div className="po-skeleton-content">
          <div className="po-column">
            <div className="po-skeleton-box po-skeleton-large" />
            <div className="po-skeleton-box po-skeleton-large" />
          </div>
          <div className="po-column">
            <div className="po-skeleton-box po-skeleton-large" />
            <div className="po-skeleton-box po-skeleton-large" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProgressSkeleton
