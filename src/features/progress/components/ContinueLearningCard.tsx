import React from 'react'
import { useNavigate } from 'react-router-dom'
import type { ContinueLearning } from '../types/progressOverview'

export interface ContinueLearningCardProps {
  continueLearning: ContinueLearning | null
}

export const ContinueLearningCard: React.FC<ContinueLearningCardProps> = ({ continueLearning }) => {
  const navigate = useNavigate()

  if (!continueLearning) {
    return (
      <section className="po-card po-completed-card" aria-label="Trạng thái hoàn thành bài học">
        <div className="po-completed-icon" aria-hidden="true">
          🌟
        </div>
        <h2 className="po-completed-title">Bạn đã hoàn thành toàn bộ bài học!</h2>
        <p className="po-completed-desc">
          Xin chúc mừng bạn đã xuất sắc vượt qua các nội dung hiện tại. Hãy ôn tập lại các bài học hoặc khám phá lộ trình bài tập mở rộng.
        </p>
        <button
          type="button"
          onClick={() => navigate('/learning-path')}
          className="po-continue-btn"
          aria-label="Đi đến trang lộ trình học"
        >
          Khám phá Lộ trình học 🚀
        </button>
      </section>
    )
  }

  const handleContinue = () => {
    navigate(`/learn/lesson/${continueLearning.lessonId}`)
  }

  const isStarted = continueLearning.status === 'in_progress'

  return (
    <section className="po-card po-continue-card" aria-label="Tiếp tục bài học gần nhất">
      <div className="po-card-header">
        <div className="po-card-title-group">
          <div className="po-card-icon po-icon-orange" aria-hidden="true">
            📖
          </div>
          <div>
            <h2 className="po-card-title">TIẾP TỤC HỌC</h2>
            <p className="po-card-subtitle">Nội dung học tập được đề xuất tiếp theo</p>
          </div>
        </div>

        <span
          className={`po-continue-badge po-continue-badge--${continueLearning.status}`}
          title={`Trạng thái: ${isStarted ? 'Đang học dở' : 'Chưa bắt đầu'}`}
        >
          {isStarted ? '⚡ Đang học dở' : '✨ Bài học mới'}
        </span>
      </div>

      <div className="po-continue-content">
        <h3 className="po-continue-lesson-title">{continueLearning.lessonTitle}</h3>

        <div className="po-continue-breadcrumbs">
          {continueLearning.levelName && (
            <span className="po-breadcrumb-chip">
              🎓 {continueLearning.levelName}
            </span>
          )}
          {continueLearning.topicTitle && (
            <span className="po-breadcrumb-chip">
              🏷️ {continueLearning.topicTitle}
            </span>
          )}
          {continueLearning.unitTitle && (
            <span className="po-breadcrumb-chip">
              📂 {continueLearning.unitTitle}
            </span>
          )}
        </div>

        <div className="po-continue-progress-row">
          <span>Tiến độ bài học:</span>
          <span>{continueLearning.progress}%</span>
        </div>

        <div
          className="po-continue-bar"
          role="progressbar"
          aria-label={`Tiến độ bài học ${continueLearning.lessonTitle}`}
          aria-valuenow={continueLearning.progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="po-continue-bar-fill"
            style={{ width: `${Math.min(100, Math.max(0, continueLearning.progress))}%` }}
          />
        </div>

        <button
          type="button"
          onClick={handleContinue}
          className="po-continue-btn"
          aria-label={`Tiếp tục học bài ${continueLearning.lessonTitle}`}
        >
          {isStarted ? 'Tiếp tục bài học ngay ➔' : 'Bắt đầu bài học này ➔'}
        </button>
      </div>
    </section>
  )
}

export default ContinueLearningCard
