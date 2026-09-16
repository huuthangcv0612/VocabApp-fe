import React from 'react'

export const LearningPathSkeleton: React.FC = () => {
  return (
    <div className="lp-skeleton-container" aria-label="Đang tải dữ liệu lộ trình...">
      {/* Header Skeleton */}
      <div className="lp-skeleton-header">
        <div className="lp-skeleton-tabs">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="lp-skeleton-box tab" />
          ))}
        </div>
        <div className="lp-skeleton-card">
          <div className="lp-skeleton-box badge" />
          <div className="lp-skeleton-box title" />
          <div className="lp-skeleton-box desc" />
          <div className="lp-skeleton-box bar" />
        </div>
      </div>

      {/* Unit Sections Skeleton */}
      {[1, 2].map((u) => (
        <div key={u} className="lp-skeleton-unit">
          <div className="lp-skeleton-unit-header">
            <div className="lp-skeleton-box u-badge" />
            <div className="lp-skeleton-box u-title" />
          </div>
          <div className="lp-skeleton-nodes">
            {[1, 2, 3].map((n) => (
              <div key={n} className="lp-skeleton-node-circle" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default LearningPathSkeleton
