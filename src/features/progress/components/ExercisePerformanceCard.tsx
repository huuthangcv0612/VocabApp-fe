import React from 'react'
import type { ExercisePerformance } from '../types/progressOverview'

export interface ExercisePerformanceCardProps {
  exercisePerformance: ExercisePerformance
}

// Friendly name map for known exercise types
const EXERCISE_TYPE_NAMES: Record<string, string> = {
  multiple_choice: 'Trắc nghiệm (Multiple Choice)',
  listening: 'Luyện nghe (Listening)',
  matching: 'Nối từ (Matching)',
  fill_blank: 'Điền từ khuyết (Fill Blank)',
  fill_in_blank: 'Điền từ khuyết (Fill Blank)',
  sentence_arrangement: 'Sắp xếp câu (Sentence Arrangement)',
  word_arrangement: 'Sắp xếp từ (Word Arrangement)',
  translation: 'Dịch câu (Translation)',
}

const formatExerciseTypeName = (rawType: string): string => {
  if (EXERCISE_TYPE_NAMES[rawType]) {
    return EXERCISE_TYPE_NAMES[rawType]
  }
  // Convert snake_case to Title Case as a fallback
  return rawType
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const ExercisePerformanceCard: React.FC<ExercisePerformanceCardProps> = ({ exercisePerformance }) => {
  const typesEntries = Object.entries(exercisePerformance.byType || {})

  return (
    <section className="po-card" aria-label="Hiệu suất làm bài tập">
      <div className="po-card-header">
        <div className="po-card-title-group">
          <div className="po-card-icon po-icon-yellow" aria-hidden="true">
            🎯
          </div>
          <div>
            <h2 className="po-card-title">HIỆU SUẤT BÀI TẬP</h2>
            <p className="po-card-subtitle">Độ chính xác và thống kê theo từng dạng bài</p>
          </div>
        </div>
      </div>

      {/* Summary Row */}
      <div className="po-perf-summary">
        <div className="po-perf-metric">
          <div className="po-perf-metric-val po-perf-metric-val--accuracy">
            {exercisePerformance.overallAccuracy}%
          </div>
          <div className="po-perf-metric-label">Độ chính xác chung</div>
        </div>

        <div className="po-perf-metric">
          <div className="po-perf-metric-val">
            {exercisePerformance.totalCorrect}
          </div>
          <div className="po-perf-metric-label">Câu trả lời đúng</div>
        </div>

        <div className="po-perf-metric">
          <div className="po-perf-metric-val">
            {exercisePerformance.totalAttempted}
          </div>
          <div className="po-perf-metric-label">Tổng lượt thử</div>
        </div>
      </div>

      {/* Breakdown by Exercise Type */}
      {typesEntries.length === 0 ? (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '16px 0', fontSize: '0.9rem' }}>
          Chưa có dữ liệu bài tập nào được ghi nhận.
        </p>
      ) : (
        <div className="po-perf-types">
          {typesEntries.map(([typeKey, perf]) => {
            const displayName = formatExerciseTypeName(typeKey)

            return (
              <div key={typeKey} className="po-perf-type-item">
                <div className="po-perf-type-header">
                  <span className="po-perf-type-name">{displayName}</span>
                  <div className="po-perf-type-stats">
                    <span className="po-perf-type-count">
                      {perf.correct}/{perf.total} đúng
                    </span>
                    <span className="po-perf-type-pct">{perf.accuracy}%</span>
                  </div>
                </div>

                <div
                  className="po-perf-type-bar"
                  role="progressbar"
                  aria-label={`Độ chính xác dạng bài ${displayName}`}
                  aria-valuenow={perf.accuracy}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="po-perf-type-fill"
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
