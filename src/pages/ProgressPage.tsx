import React from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useProgressOverview } from '../features/progress/hooks/useProgressOverview'
import ProgressHeaderBanner from '../features/progress/components/ProgressHeaderBanner'
import ProgressOverviewGrid from '../features/progress/components/ProgressOverviewGrid'
import ContinueLearningCard from '../features/progress/components/ContinueLearningCard'
import LevelProgressSection from '../features/progress/components/LevelProgressSection'
import VocabularyMasteryCard from '../features/progress/components/VocabularyMasteryCard'
import ExercisePerformanceCard from '../features/progress/components/ExercisePerformanceCard'
import ActivityHistoryCard from '../features/progress/components/ActivityHistoryCard'
import ProgressSkeleton from '../features/progress/components/ProgressSkeleton'

import '../styles/pages/progress.css'
import '../features/progress/styles/progressOverview.css'

export const ProgressPage: React.FC = () => {
  const navigate = useNavigate()
  const { data, loading, error, refetch } = useProgressOverview()

  return (
    <div className="progress-page">
      <Header />

      {/* Hero Banner Section */}
      <ProgressHeaderBanner
        currentLevel={data?.overview?.currentLevel}
        levelCompletionPercentage={data?.overview?.levelCompletionPercentage}
        streak={data?.overview?.streak}
      />

      {/* Main Content Area */}
      <main className="progress-main-section">
        {loading ? (
          <ProgressSkeleton />
        ) : error ? (
          /* Error State */
          <div className="po-container">
            <section className="po-state-container" aria-label="Lỗi tải tiến độ">
              <div className="po-state-icon" aria-hidden="true">
                ⚠️
              </div>
              <h2 className="po-state-title">Không thể tải tiến độ học tập.</h2>
              <p className="po-state-desc">
                Đã xảy ra sự cố khi kết nối với máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.
              </p>
              <button
                type="button"
                onClick={refetch}
                className="po-btn-primary"
                aria-label="Thử tải lại tiến độ học tập"
              >
                Thử lại 🔄
              </button>
            </section>
          </div>
        ) : !data || (!data.overview && !data.levels?.length) ? (
          /* Empty / New User State */
          <div className="po-container">
            <section className="po-state-container" aria-label="Chưa có dữ liệu tiến độ">
              <div className="po-state-icon" aria-hidden="true">
                🌱
              </div>
              <h2 className="po-state-title">Bắt đầu hành trình học tiếng Đức của bạn!</h2>
              <p className="po-state-desc">
                Bạn chưa bắt đầu bài học nào. Hãy tham gia ngay các bài học thú vị đầu tiên để theo dõi tiến độ và tích lũy điểm thưởng XP!
              </p>
              <button
                type="button"
                onClick={() => navigate('/learning-path')}
                className="po-btn-primary"
                aria-label="Đi đến lộ trình học để bắt đầu học"
              >
                Bắt đầu học 🚀
              </button>
            </section>
          </div>
        ) : (
          /* Data Dashboard State */
          <div className="po-container">
            <div className="po-main-layout">
              {/* 1. Six Core Metrics Grid */}
              <ProgressOverviewGrid overview={data.overview} />

              {/* 2. Continue Learning Next Lesson Card */}
              <ContinueLearningCard continueLearning={data.continueLearning} />

              {/* 3. Two-column Detailed Sections */}
              <div className="po-content-grid">
                {/* Left Column: Levels Progress & Exercise Performance */}
                <div className="po-column">
                  <LevelProgressSection levels={data.levels} />
                  <ExercisePerformanceCard exercisePerformance={data.exercisePerformance} />
                </div>

                {/* Right Column: Vocabulary Mastery & Activity History */}
                <div className="po-column">
                  <VocabularyMasteryCard vocabulary={data.vocabulary} />
                  <ActivityHistoryCard activity={data.activity} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default ProgressPage
