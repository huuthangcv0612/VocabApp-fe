import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { progressService } from '../services/progressService'
import type { DashboardProgressOverview } from '../types/progress'
import CloudIcon from '../assets/Cloud.svg'
import '../styles/pages/progress.css'

const ProgressPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardProgressOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await progressService.getDashboardOverview()
      setDashboard(data)
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin tiến độ.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const masteryTotal = dashboard
    ? dashboard.masteryBreakdown.new +
      dashboard.masteryBreakdown.learning +
      dashboard.masteryBreakdown.review +
      dashboard.masteryBreakdown.mastered
    : 1

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
              Theo dõi kết quả học tập real-time: Tiến độ hôm nay, Bài học đã xong, Trạng thái làm chủ từ vựng (Mastery) và Điểm XP.
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
              <button onClick={fetchDashboard} className="retry-btn">
                Thử lại
              </button>
            </div>
          )}

          {!loading && dashboard && (
            <>
              {/* 1. Today's Progress & Key Stats Grid */}
              <div className="overall-stats-grid">
                <div className="stat-card blue-card">
                  <div className="stat-card-header">
                    <div className="stat-icon-wrapper blue-icon">📅</div>
                    <span className="stat-card-label">TIẾN ĐỘ HÔM NAY</span>
                  </div>
                  <div className="stat-card-value">
                    {dashboard.todayLearnedCount} <span className="stat-total">từ vựng</span>
                  </div>
                  <p className="stat-card-sub">⚡ +{dashboard.todayXpEarned} XP tích lũy trong ngày</p>
                </div>

                <div className="stat-card yellow-card">
                  <div className="stat-card-header">
                    <div className="stat-icon-wrapper yellow-icon">🎓</div>
                    <span className="stat-card-label">BÀI HỌC HOÀN THÀNH</span>
                  </div>
                  <div className="stat-card-value">{dashboard.lessonsCompletedCount} Lessons</div>
                  <p className="stat-card-sub">đã hoàn thành tất cả exercises</p>
                </div>

                <div className="stat-card red-card">
                  <div className="stat-card-header">
                    <div className="stat-icon-wrapper red-icon">⚡</div>
                    <span className="stat-card-label">TỔNG ĐIỂM XP THƯỞNG</span>
                  </div>
                  <div className="stat-card-value">{dashboard.totalXp} XP</div>
                  <p className="stat-card-sub">tích lũy qua bài tập</p>
                </div>
              </div>

              {/* 2. Vocabulary Mastery Breakdown Section */}
              <div className="breakdown-card" style={{ marginTop: '24px', padding: '32px' }}>
                <div className="breakdown-header" style={{ marginBottom: '20px' }}>
                  <span className="breakdown-icon">🧠</span>
                  <h2 className="breakdown-title">Trạng Thái Làm Chủ Từ Vựng (Vocabulary Mastery State)</h2>
                </div>

                <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '24px' }}>
                  Đánh giá từ vựng dựa trên tương tác trả lời bài tập: <strong style={{ color: '#0f172a' }}>New</strong> (Xem Preview), <strong style={{ color: '#0284c7' }}>Learning</strong> (Đang học), <strong style={{ color: '#d97706' }}>Review</strong> (Cần ôn tập), <strong style={{ color: '#16a34a' }}>Mastered</strong> (Đã thành thạo).
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                  <div style={{ backgroundColor: '#f1f5f9', padding: '20px', borderRadius: '16px', borderLeft: '4px solid #64748b' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>✨ NEW (Từ Mới)</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                      {dashboard.masteryBreakdown.new} từ
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Vừa xem preview</div>
                  </div>

                  <div style={{ backgroundColor: '#e0f2fe', padding: '20px', borderRadius: '16px', borderLeft: '4px solid #0284c7' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>📖 LEARNING (Đang Học)</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0369a1', margin: '4px 0' }}>
                      {dashboard.masteryBreakdown.learning} từ
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#0284c7' }}>Đang thực hành exercises</div>
                  </div>

                  <div style={{ backgroundColor: '#fef3c7', padding: '20px', borderRadius: '16px', borderLeft: '4px solid #d97706' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>🔄 REVIEW (Cần Ôn Tập)</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#b45309', margin: '4px 0' }}>
                      {dashboard.masteryBreakdown.review} từ
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#d97706' }}>Trả lời sai trong bài tập</div>
                  </div>

                  <div style={{ backgroundColor: '#dcfce7', padding: '20px', borderRadius: '16px', borderLeft: '4px solid #16a34a' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>🏆 MASTERED (Thành Thạo)</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#15803d', margin: '4px 0' }}>
                      {dashboard.masteryBreakdown.mastered} từ
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#16a34a' }}>Trả lời đúng nhiều lần</div>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div style={{ height: '16px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', display: 'flex' }}>
                  <div
                    style={{
                      width: `${Math.round((dashboard.masteryBreakdown.mastered / masteryTotal) * 100)}%`,
                      backgroundColor: '#16a34a',
                    }}
                    title="Mastered"
                  ></div>
                  <div
                    style={{
                      width: `${Math.round((dashboard.masteryBreakdown.learning / masteryTotal) * 100)}%`,
                      backgroundColor: '#0284c7',
                    }}
                    title="Learning"
                  ></div>
                  <div
                    style={{
                      width: `${Math.round((dashboard.masteryBreakdown.review / masteryTotal) * 100)}%`,
                      backgroundColor: '#d97706',
                    }}
                    title="Review"
                  ></div>
                  <div
                    style={{
                      width: `${Math.round((dashboard.masteryBreakdown.new / masteryTotal) * 100)}%`,
                      backgroundColor: '#94a3b8',
                    }}
                    title="New"
                  ></div>
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
