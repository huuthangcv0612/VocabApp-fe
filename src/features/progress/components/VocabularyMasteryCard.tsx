import React from 'react'
import type { VocabularyProgress } from '../types/progressOverview'

export interface VocabularyMasteryCardProps {
  vocabulary: VocabularyProgress
}

export const VocabularyMasteryCard: React.FC<VocabularyMasteryCardProps> = ({ vocabulary }) => {
  // Safe total for visualization ratio between active states (mastered, learning, needReview)
  const activeSum = (vocabulary.mastered + vocabulary.learning + vocabulary.needReview) || 1
  const masteredPct = Math.round((vocabulary.mastered / activeSum) * 100)
  const learningPct = Math.round((vocabulary.learning / activeSum) * 100)
  const needReviewPct = Math.max(0, 100 - masteredPct - learningPct)

  return (
    <section className="po-card" aria-label="Trạng thái làm chủ từ vựng">
      <div className="po-card-header">
        <div className="po-card-title-group">
          <div className="po-card-icon po-icon-green" aria-hidden="true">
            🧠
          </div>
          <div>
            <h2 className="po-card-title">LÀM CHỦ TỪ VỰNG</h2>
            <p className="po-card-subtitle">Trạng thái từ vựng theo tương tác bài tập</p>
          </div>
        </div>
      </div>

      <div className="po-vocab-grid">
        {/* 1. Learned */}
        <div className="po-vocab-item po-vocab-item--learned">
          <span className="po-vocab-item-label">Tổng đã học</span>
          <span className="po-vocab-item-value">{vocabulary.learned}</span>
          <span className="po-vocab-item-sub">từ vựng đã tiếp xúc</span>
        </div>

        {/* 2. Mastered */}
        <div className="po-vocab-item po-vocab-item--mastered">
          <span className="po-vocab-item-label" style={{ color: '#047857' }}>🏆 Thành thạo</span>
          <span className="po-vocab-item-value" style={{ color: '#047857' }}>{vocabulary.mastered}</span>
          <span className="po-vocab-item-sub">trả lời đúng nhiều lần</span>
        </div>

        {/* 3. Learning */}
        <div className="po-vocab-item po-vocab-item--learning">
          <span className="po-vocab-item-label" style={{ color: '#1d4ed8' }}>📖 Đang học</span>
          <span className="po-vocab-item-value" style={{ color: '#1d4ed8' }}>{vocabulary.learning}</span>
          <span className="po-vocab-item-sub">đang thực hành bài tập</span>
        </div>

        {/* 4. Need Review */}
        <div className="po-vocab-item po-vocab-item--needReview">
          <span className="po-vocab-item-label" style={{ color: '#c2410c' }}>🔄 Cần ôn tập</span>
          <span className="po-vocab-item-value" style={{ color: '#c2410c' }}>{vocabulary.needReview}</span>
          <span className="po-vocab-item-sub">cần củng cố thêm</span>
        </div>
      </div>

      {/* Segmented Visual Progress Bar */}
      <div
        className="po-vocab-segmented-bar"
        role="progressbar"
        aria-label="Tỷ lệ phân bố từ vựng thành thạo, đang học và cần ôn tập"
        aria-valuenow={masteredPct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="po-vocab-seg po-vocab-seg--mastered"
          style={{ width: `${masteredPct}%` }}
          title={`Thành thạo: ${vocabulary.mastered} từ (${masteredPct}%)`}
        />
        <div
          className="po-vocab-seg po-vocab-seg--learning"
          style={{ width: `${learningPct}%` }}
          title={`Đang học: ${vocabulary.learning} từ (${learningPct}%)`}
        />
        <div
          className="po-vocab-seg po-vocab-seg--needReview"
          style={{ width: `${needReviewPct}%` }}
          title={`Cần ôn tập: ${vocabulary.needReview} từ (${needReviewPct}%)`}
        />
      </div>

      {/* Legend */}
      <div className="po-vocab-legend" aria-hidden="true">
        <div className="po-legend-item">
          <span className="po-legend-dot" style={{ backgroundColor: '#10b981' }}></span>
          <span>Thành thạo ({vocabulary.mastered})</span>
        </div>
        <div className="po-legend-item">
          <span className="po-legend-dot" style={{ backgroundColor: '#3b82f6' }}></span>
          <span>Đang học ({vocabulary.learning})</span>
        </div>
        <div className="po-legend-item">
          <span className="po-legend-dot" style={{ backgroundColor: '#f97316' }}></span>
          <span>Cần ôn ({vocabulary.needReview})</span>
        </div>
      </div>
    </section>
  )
}

export default VocabularyMasteryCard
