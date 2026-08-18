import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useProgressOverview } from '../hooks/useApi'
import CloudIcon from '../assets/Cloud.svg'
import '../styles/pages/progress.css'

const ProgressPage = () => {
  const { overview, loading, error, refetch } = useProgressOverview()

  const totalLearned = overview?.totalLearnedWords ?? 0
  const totalWords = overview?.totalWords ?? 0
  const completionPercentage = totalWords > 0 ? Math.round((totalLearned / totalWords) * 100) : 0

  const activeLevelsCount = overview?.levelProgress?.filter((item) => (item.percentage ?? 0) > 0).length ?? 0

  return (
    <div className="progress-page">
      <Header />

      {/* Hero Banner Section */}
      <section className="progress-hero-section">
        <img src={CloudIcon} alt="" className="hero-cloud cloud-1" />
        <img src={CloudIcon} alt="" className="hero-cloud cloud-2" />

        <div className="progress-hero-container">
          <div className="progress-hero-content">
            <Link to="/levels" className="back-link">
              ← Quay lại danh sách bài học
            </Link>

            <h1 className="progress-hero-title">TIẾN ĐỘ HỌC TẬP</h1>
            <p className="progress-hero-subtitle">
              Theo dõi kết quả tích lũy từ vựng tiếng Đức của bạn theo Cấp độ và Chủ đề.
            </p>
          </div>
        </div>

        <div className="progress-hero-wave"></div>
      </section>

      {/* Main Content Section */}
      <main className="progress-main-section">
        <div className="progress-container">
          {loading && <p className="status-text">Đang tải thông tin tiến độ...</p>}

          {error && (
            <div className="status-text error">
              <p>Lỗi: {error}</p>
              <button onClick={() => refetch()} className="retry-btn">
                Thử lại
              </button>
            </div>
          )}

          {!loading && overview && (
            <>
              {/* Overall Overview Cards */}
              <div className="overall-stats-grid">
                <div className="stat-card blue-card">
                  <div className="stat-card-header">
                    <div className="stat-icon-wrapper blue-icon">🎓</div>
                    <span className="stat-card-label">TỔNG TỪ ĐÃ HỌC</span>
                  </div>
                  <div className="stat-card-value">
                    {totalLearned} <span className="stat-total">/ {totalWords}</span>
                  </div>
                  <p className="stat-card-sub">từ vựng đã ghi nhớ</p>
                </div>

                <div className="stat-card red-card">
                  <div className="stat-card-header">
                    <div className="stat-icon-wrapper red-icon">🏆</div>
                    <span className="stat-card-label">TỶ LỆ HOÀN THÀNH</span>
                  </div>
                  <div className="stat-card-value">{completionPercentage}%</div>
                  <div className="stat-progress-bar-bg">
                    <div
                      className="stat-progress-bar-fill"
                      style={{ width: `${Math.min(completionPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="stat-card yellow-card">
                  <div className="stat-card-header">
                    <div className="stat-icon-wrapper yellow-icon">🚀</div>
                    <span className="stat-card-label">CẤP ĐỘ ĐÃ TÍCH LŨY</span>
                  </div>
                  <div className="stat-card-value">{activeLevelsCount} Cấp độ</div>
                  <p className="stat-card-sub">đang học & hoàn thành</p>
                </div>
              </div>

              {/* Progress Breakdown Grid (Level vs Topic) */}
              <div className="progress-breakdown-grid">
                {/* Level Breakdown */}
                <div className="breakdown-card">
                  <div className="breakdown-header">
                    <span className="breakdown-icon">📊</span>
                    <h2 className="breakdown-title">Tiến độ theo Cấp độ (Level)</h2>
                  </div>

                  <div className="breakdown-list">
                    {overview.levelProgress && overview.levelProgress.length > 0 ? (
                      overview.levelProgress.map((item) => {
                        const pct = Math.min(Math.round(item.percentage || 0), 100)
                        const isDone = pct === 100

                        return (
                          <div key={item.levelId} className="breakdown-item">
                            <div className="breakdown-item-info">
                              <span className="breakdown-item-name">Level {item.levelName}</span>
                              <span className="breakdown-item-count">
                                {item.learnedCount && item.totalCount
                                  ? `${item.learnedCount}/${item.totalCount} từ • `
                                  : ''}
                                {pct}%
                              </span>
                            </div>
                            <div className="breakdown-bar-bg">
                              <div
                                className={`breakdown-bar-fill ${isDone ? 'completed' : ''}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="empty-state">
                        <p>Chưa có dữ liệu tiến độ cấp độ.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Topic Breakdown */}
                <div className="breakdown-card">
                  <div className="breakdown-header">
                    <span className="breakdown-icon">🏷️</span>
                    <h2 className="breakdown-title">Tiến độ theo Chủ đề (Topic)</h2>
                  </div>

                  <div className="breakdown-list">
                    {overview.topicProgress && overview.topicProgress.length > 0 ? (
                      overview.topicProgress.map((item) => {
                        const pct = Math.min(Math.round(item.percentage || 0), 100)
                        const isDone = pct === 100

                        return (
                          <div key={item.topicId} className="breakdown-item">
                            <div className="breakdown-item-info">
                              <span className="breakdown-item-name">{item.topicName}</span>
                              <span className="breakdown-item-count">
                                {item.learnedCount && item.totalCount
                                  ? `${item.learnedCount}/${item.totalCount} từ • `
                                  : ''}
                                {pct}%
                              </span>
                            </div>
                            <div className="breakdown-bar-bg">
                              <div
                                className={`breakdown-bar-fill topic-fill ${isDone ? 'completed' : ''}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="empty-state">
                        <p>Chưa có dữ liệu tiến độ chủ đề.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ProgressPage
