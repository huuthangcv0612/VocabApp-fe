import React from 'react'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import { useLearningPath } from '../hooks/useLearningPath'
import LearningPathHeader from '../components/LearningPathHeader'
import UnitSection from '../components/UnitSection'
import LearningPathSidebar from '../components/LearningPathSidebar'
import LearningPathSkeleton from '../components/LearningPathSkeleton'
import '../styles/learningPath.css'

export const LearningPathPage: React.FC = () => {
  const {
    data,
    activeLevel,
    selectedLevelId,
    setSelectedLevelId,
    loading,
    error,
    refetch,
  } = useLearningPath()

  return (
    <div className="learning-path-page">
      <Header />

      <main className="lp-main-container">
        {loading ? (
          <LearningPathSkeleton />
        ) : error ? (
          <div className="lp-error-state">
            <div className="lp-error-icon">⚠️</div>
            <h3 className="lp-error-title">Không thể tải Lộ trình học</h3>
            <p className="lp-error-desc">{error}</p>
            <button type="button" className="lp-retry-btn" onClick={refetch}>
              Thử lại 🔄
            </button>
          </div>
        ) : !data || !activeLevel ? (
          <div className="lp-empty-state">
            <div className="lp-empty-icon">🗺️</div>
            <h3 className="lp-empty-title">Chưa có dữ liệu Lộ trình</h3>
            <p className="lp-empty-desc">Hệ thống đang cập nhật các chương học mới.</p>
          </div>
        ) : (
          <div className="lp-layout-grid">
            {/* Main Content Column */}
            <div className="lp-content-column">
              {/* Header with Level Selector Tabs & Progress */}
              <LearningPathHeader
                levels={data.levels}
                activeLevel={activeLevel}
                selectedLevelId={selectedLevelId}
                onSelectLevel={setSelectedLevelId}
              />

              {/* Units & Lesson Journey */}
              {activeLevel.units && activeLevel.units.length > 0 ? (
                activeLevel.units.map((unit, uIdx) => (
                  <UnitSection key={unit._id} unit={unit} unitIndex={uIdx} />
                ))
              ) : (
                <div className="lp-empty-state">
                  <div className="lp-empty-icon">📚</div>
                  <h3 className="lp-empty-title">
                    Chưa có Unit nào trong Trình độ {activeLevel.level_name}
                  </h3>
                  <p className="lp-empty-desc">
                    Vui lòng chọn trình độ khác hoặc quay lại sau.
                  </p>
                </div>
              )}
            </div>

            {/* Right Sidebar Column */}
            <LearningPathSidebar
              completedLessonsCount={activeLevel.completedLessonsCount}
              totalLessonsCount={activeLevel.totalLessonsCount}
              progressPercentage={activeLevel.progressPercentage}
              totalXp={activeLevel.units.reduce((sum, u) => sum + (u.totalXp || 0), 0)}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default LearningPathPage
