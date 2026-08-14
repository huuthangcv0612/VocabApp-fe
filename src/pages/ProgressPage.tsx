import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useProgressOverview } from '../hooks/useApi'
import '../styles/pages/progress.css'

const ProgressPage = () => {
  const { overview, loading, error } = useProgressOverview()

  return (
    <div className="progress-page">
      <Header />

      <main className="progress-main">
        <div className="progress-container">
          <Link to="/levels" className="back-link" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
            ← Quay lại danh sách bài học
          </Link>

          <div className="progress-header">
            <h1 className="progress-title">Tiến Độ Học Tập</h1>
            <p className="progress-subtitle">
              Theo dõi kết quả học tập từ vựng tiếng Đức của bạn theo Cấp độ và Chủ đề.
            </p>
          </div>

          {loading && <p className="status-text">Đang tải thông tin tiến độ...</p>}
          {error && <p className="status-text error">Lỗi: {error}</p>}

          {!loading && overview && (
            <>
              {/* Tổng quan tổng số từ vựng */}
              <div className="overall-stat-card">
                <div className="stat-group">
                  <div className="stat-icon">🎓</div>
                  <div className="stat-info">
                    <h3>Tổng từ đã học</h3>
                    <div className="stat-number">
                      {overview.totalLearnedWords || 0} / {overview.totalWords || 0}
                    </div>
                  </div>
                </div>

                <div className="stat-group">
                  <div className="stat-icon">🏆</div>
                  <div className="stat-info">
                    <h3>Tỷ lệ hoàn thành</h3>
                    <div className="stat-number">
                      {overview.totalWords > 0
                        ? Math.round((overview.totalLearnedWords / overview.totalWords) * 100)
                        : 0}
                      %
                    </div>
                  </div>
                </div>
              </div>

              {/* Chi tiết tiến độ Level & Topic */}
              <div className="progress-sections-grid">
                {/* Theo Level */}
                <div className="progress-box">
                  <h2 className="progress-box-title">📊 Tiến độ theo Cấp độ (Level)</h2>
                  <div className="progress-item-list">
                    {overview.levelProgress && overview.levelProgress.length > 0 ? (
                      overview.levelProgress.map((item) => (
                        <div key={item.levelId} className="progress-item">
                          <div className="progress-item-header">
                            <span>Level {item.levelName}</span>
                            <span>{item.percentage}%</span>
                          </div>
                          <div className="progress-item-bar">
                            <div
                              className={`progress-item-fill ${item.percentage === 100 ? 'completed' : ''}`}
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="status-text">Chưa có dữ liệu tiến độ cấp độ.</p>
                    )}
                  </div>
                </div>

                {/* Theo Topic */}
                <div className="progress-box">
                  <h2 className="progress-box-title">🏷️ Tiến độ theo Chủ đề (Topic)</h2>
                  <div className="progress-item-list">
                    {overview.topicProgress && overview.topicProgress.length > 0 ? (
                      overview.topicProgress.map((item) => (
                        <div key={item.topicId} className="progress-item">
                          <div className="progress-item-header">
                            <span>{item.topicName}</span>
                            <span>{item.percentage}%</span>
                          </div>
                          <div className="progress-item-bar">
                            <div
                              className={`progress-item-fill ${item.percentage === 100 ? 'completed' : ''}`}
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="status-text">Chưa có dữ liệu tiến độ chủ đề.</p>
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
