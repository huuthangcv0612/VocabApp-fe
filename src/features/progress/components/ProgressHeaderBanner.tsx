import React from 'react'
import { Link } from 'react-router-dom'
import CloudIcon from '../../../assets/Cloud.svg'
import type { CurrentLevel } from '../types/progressOverview'

export interface ProgressHeaderBannerProps {
  currentLevel?: CurrentLevel
  levelCompletionPercentage?: number
  streak?: number
}

export const ProgressHeaderBanner: React.FC<ProgressHeaderBannerProps> = ({
  currentLevel,
  levelCompletionPercentage = 0,
  streak = 0,
}) => {
  return (
    <section className="progress-hero-section" aria-label="Tiến độ học tập">
      <img src={CloudIcon} alt="" className="hero-cloud cloud-1" aria-hidden="true" />
      <img src={CloudIcon} alt="" className="hero-cloud cloud-2" aria-hidden="true" />

      <div className="progress-hero-container">
        <div className="progress-hero-content">
          <Link to="/learning-path" className="back-link">
            ← Quay lại Lộ trình học
          </Link>

          <h1 className="progress-hero-title">TIẾN ĐỘ HỌC TẬP</h1>
          <p className="progress-hero-subtitle">
            Theo dõi hành trình chinh phục tiếng Đức: Chuỗi học tập, Tiến độ cấp độ, Làm chủ từ vựng và Hiệu suất bài tập.
          </p>

          <div className="po-hero-badges">
            {streak > 0 && (
              <span className="po-hero-badge po-hero-badge--streak" title="Chuỗi ngày học liên tục">
                🔥 {streak} ngày streak liên tiếp
              </span>
            )}

            {currentLevel && (
              <span className="po-hero-badge po-hero-badge--level" title="Cấp độ hiện tại">
                🎓 Trình độ: {currentLevel.level_name}
              </span>
            )}

            <span className="po-hero-badge po-hero-badge--progress" title="Tiến độ hoàn thành cấp độ hiện tại">
              🎯 Hoàn thành {levelCompletionPercentage}%
            </span>
          </div>
        </div>
      </div>

      <div className="progress-hero-wave" aria-hidden="true"></div>
    </section>
  )
}

export default ProgressHeaderBanner
