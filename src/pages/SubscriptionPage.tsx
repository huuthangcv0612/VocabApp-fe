import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { subscriptionService } from '../services/subscriptionService'
import type { UserSubscription } from '../types/gamification'
import CloudIcon from '../assets/Cloud.svg'
import '../styles/pages/progress.css'

export const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate()

  const [sub, setSub] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const currentSub = await subscriptionService.getCurrentSubscription()
        setSub(currentSub)
      } catch (err: unknown) {
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

            <h1 className="progress-hero-title">GÓI DỊCH VỤ CỦA TÔI</h1>
            <p className="progress-hero-subtitle">
              Quản lý thông tin gói dịch vụ hiện tại, thời hạn sử dụng và các quyền lợi đi kèm.
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
            <div className="admin-card" style={{ padding: '32px', borderRadius: '24px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <span className={`badge-pill ${sub?.plan_id === 'free' ? 'badge-draft' : 'badge-active'}`} style={{ marginBottom: '8px', display: 'inline-block' }}>
                    {sub?.isPremium ? 'Gói Nâng Cấp' : 'Gói Miễn Phí'}
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
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: sub?.isPremium ? '#16a34a' : '#64748b', textTransform: 'uppercase', marginTop: '2px' }}>
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
                    {sub?.features && sub.features.length > 0 ? sub.features.join(', ') : 'Học bài cơ bản'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default SubscriptionPage
