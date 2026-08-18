import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { subscriptionService } from '../services/subscriptionService'
import type { SubscriptionPackage, UserSubscription } from '../types/gamification'
import CloudIcon from '../assets/Cloud.svg'
import '../styles/pages/progress.css'

export const PricingPage: React.FC = () => {
  const navigate = useNavigate()

  const [packages, setPackages] = useState<SubscriptionPackage[]>([])
  const [currentSub, setCurrentSub] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [pkgList, sub] = await Promise.all([
          subscriptionService.getPackages(),
          subscriptionService.getCurrentSubscription(),
        ])
        setPackages(pkgList)
        setCurrentSub(sub)
      } catch (err) {
        console.warn('Error loading pricing data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn Phí'
    return `${price.toLocaleString('vi-VN')} VNĐ / tháng`
  }

  return (
    <div className="progress-page">
      <Header />

      {/* Hero Banner Section */}
      <section className="progress-hero-section">
        <img src={CloudIcon} alt="" className="hero-cloud cloud-1" />
        <img src={CloudIcon} alt="" className="hero-cloud cloud-2" />

        <div className="progress-hero-container">
          <div className="progress-hero-content">
            <Link to="/subscription" className="back-link">
              ← Quản lý gói hiện tại
            </Link>

            <h1 className="progress-hero-title">BẢNG GIÁ GÓI DỊCH VỤ</h1>
            <p className="progress-hero-subtitle">
              Lựa chọn gói học tập phù hợp để mở khóa 100% tính năng AI, bài tập tương tác và tăng tốc khả năng tiếng Đức.
            </p>
          </div>
        </div>

        <div className="progress-hero-wave"></div>
      </section>

      {/* Main Pricing Cards Grid */}
      <main className="progress-main-section" style={{ padding: '40px 20px 80px 20px' }}>
        <div className="progress-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div className="admin-spinner" style={{ margin: '0 auto 16px auto' }}></div>
              <p>Đang tải các gói dịch vụ...</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
                alignItems: 'stretch',
              }}
            >
              {packages.map((pkg) => {
                const isCurrent = currentSub?.plan_id === pkg.id
                const isPopular = pkg.id === 'premium'
                const isPro = pkg.id === 'pro'

                return (
                  <div
                    key={pkg.id}
                    className="admin-card"
                    style={{
                      padding: '36px 28px',
                      borderRadius: '24px',
                      border: isPopular
                        ? '3px solid #2a63e8'
                        : isPro
                        ? '3px solid #8b5cf6'
                        : '1px solid #cbd5e1',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: isPopular ? '0 12px 30px rgba(42,99,232,0.15)' : 'none',
                    }}
                  >
                    {pkg.badge && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '-14px',
                          right: '24px',
                          backgroundColor: isPopular ? '#2a63e8' : '#8b5cf6',
                          color: '#fff',
                          padding: '4px 14px',
                          borderRadius: '999px',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                        }}
                      >
                        {pkg.badge}
                      </div>
                    )}

                    <div>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                        {pkg.name}
                      </h3>

                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: isPopular ? '#2a63e8' : isPro ? '#8b5cf6' : '#0f172a', margin: '16px 0 24px 0' }}>
                        {formatPrice(pkg.price)}
                      </div>

                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', marginBottom: '24px' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                          ĐẶC QUYỀN GÓI:
                        </div>
                        <ul style={{ paddingLeft: 0, listStyle: 'none', margin: 0, display: 'grid', gap: '12px' }}>
                          {pkg.features.map((feat, idx) => (
                            <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.92rem', color: '#334155' }}>
                              <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <button
                      className="tool-button"
                      disabled={isCurrent}
                      onClick={() => navigate(`/payment/${pkg.id}`)}
                      style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '9999px',
                        fontSize: '1rem',
                        fontWeight: 700,
                        backgroundColor: isCurrent ? '#94a3b8' : isPopular ? '#2a63e8' : isPro ? '#8b5cf6' : '#475569',
                      }}
                    >
                      {isCurrent ? 'Gói Hiện Tại Của Bạn' : pkg.price === 0 ? 'Dùng Gói Miễn Phí' : 'Nâng Cấp Gói Này ▶'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default PricingPage
