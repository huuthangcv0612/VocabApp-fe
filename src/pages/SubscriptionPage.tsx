import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { subscriptionService } from '../services/subscriptionService'
import type {
  UserSubscription,
  AchievementItem,
  UserStreak,
} from '../types/gamification'
import CloudIcon from '../assets/Cloud.svg'
import '../styles/pages/progress.css'

export const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate()

  const [sub, setSub] = useState<UserSubscription | null>(null)
  const [gamification, setGamification] = useState<{ xp: number; streak: UserStreak } | null>(null)
  const [achievements, setAchievements] = useState<AchievementItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [currentSub, gData, achList] = await Promise.all([
          subscriptionService.getCurrentSubscription(),
          subscriptionService.getUserProfileGamification(),
          subscriptionService.getAchievements(),
        ])
        setSub(currentSub)
        setGamification(gData)
        setAchievements(achList)
      } catch (err) {
        console.warn('Error loading subscription data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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
              ← Trở về danh sách bài học
            </Link>

            <h1 className="progress-hero-title">GÓI DỊCH VỤ & GAMIFICATION</h1>
            <p className="progress-hero-subtitle">
              Quản lý gói dịch vụ hiện tại, theo dõi chuỗi Streak học tập 🔥, điểm XP ⚡ và các danh hiệu Achievements.
            </p>
          </div>
        </div>

        <div className="progress-hero-wave"></div>
      </section>

      {/* Main Content Section */}
      <main className="progress-main-section" style={{ padding: '40px 20px 80px 20px' }}>
        <div className="progress-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div className="admin-spinner" style={{ margin: '0 auto 16px auto' }}></div>
              <p>Đang tải thông tin tài khoản...</p>
            </div>
          ) : (
            <>
              {/* 1. Subscription Card */}
              <div className="admin-card" style={{ padding: '32px', borderRadius: '24px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <span className={`badge-pill ${sub?.plan_id === 'free' ? 'badge-draft' : 'badge-active'}`} style={{ marginBottom: '8px', display: 'inline-block' }}>
                      {sub?.plan_id === 'free' ? 'Gói Miễn Phí' : 'Gói Nâng Cấp'}
                    </span>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {sub?.plan_name || 'Gói Free'}
                    </h2>
                  </div>

                  <button
                    className="btn-admin-primary"
                    onClick={() => navigate('/pricing')}
                    style={{ padding: '12px 24px', borderRadius: '9999px' }}
                  >
                    ✨ Nâng Cấp / Đổi Gói Dịch Vụ
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>TRẠNG THÁI GÓI</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', marginTop: '2px' }}>
                      ● {sub?.status || 'Active'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>NGÀY HẾT HẠN</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                      {sub?.end_date ? new Date(sub.end_date).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>TÍNH NĂNG ĐƯỢC PHÉP</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#2a63e8', marginTop: '2px' }}>
                      {sub?.features ? sub.features.join(', ') : 'Học bài cơ bản'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Streak & XP Gamification Cards */}
              <div className="overall-stats-grid" style={{ marginBottom: '28px' }}>
                <div className="stat-card red-card">
                  <div className="stat-card-header">
                    <div className="stat-icon-wrapper red-icon">🔥</div>
                    <span className="stat-card-label">CHUỖI STREAK HỌC TẬP</span>
                  </div>
                  <div className="stat-card-value">
                    {gamification?.streak.current_streak || 0} <span className="stat-total">Ngày</span>
                  </div>
                  <p className="stat-card-sub">Kỷ lục dài nhất: {gamification?.streak.longest_streak || 0} ngày liên tiếp</p>
                </div>

                <div className="stat-card yellow-card">
                  <div className="stat-card-header">
                    <div className="stat-icon-wrapper yellow-icon">⚡</div>
                    <span className="stat-card-label">TỔNG ĐIỂM THƯỞNG XP</span>
                  </div>
                  <div className="stat-card-value">{gamification?.xp || 0} XP</div>
                  <p className="stat-card-sub">Do backend tính toán tự động</p>
                </div>
              </div>

              {/* 3. Achievements Section */}
              <div className="breakdown-card" style={{ padding: '32px' }}>
                <div className="breakdown-header" style={{ marginBottom: '20px' }}>
                  <span className="breakdown-icon">🏆</span>
                  <h2 className="breakdown-title">Danh Hiệu Đạt Được (Achievements System)</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  {achievements.map((ach) => (
                    <div
                      key={ach._id}
                      style={{
                        padding: '20px',
                        borderRadius: '20px',
                        backgroundColor: ach.unlocked ? '#f0fdf4' : '#f8fafc',
                        border: ach.unlocked ? '2px solid #22c55e' : '1px solid #e2e8f0',
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div style={{ fontSize: '2.5rem', opacity: ach.unlocked ? 1 : 0.4 }}>{ach.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: ach.unlocked ? '#15803d' : '#0f172a' }}>
                            {ach.title}
                          </h4>
                          {ach.unlocked && <span className="badge-pill badge-active">✓ Unlocked</span>}
                        </div>
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#64748b' }}>
                          {ach.description}
                        </p>

                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: ach.unlocked ? '#16a34a' : '#94a3b8' }}>
                          Tiến độ: {ach.progress} / {ach.target_value} • Thưởng: +{ach.xp_reward} XP
                        </div>
                      </div>
                    </div>
                  ))}
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

export default SubscriptionPage
