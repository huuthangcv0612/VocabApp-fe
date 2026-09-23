import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { subscriptionService, BackendSubscriptionResponse } from '../services/subscriptionService'
import type { UserSubscription } from '../types/gamification'
import CloudIcon from '../assets/Cloud.svg'
import '../styles/pages/progress.css'

export const SubscriptionPage: React.FC = () => {
  const { t } = useTranslation(['subscription', 'common'])
  const navigate = useNavigate()

  const [sub, setSub] = useState<UserSubscription | null>(null)
  const [history, setHistory] = useState<BackendSubscriptionResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [currentSub, subHistory] = await Promise.all([
          subscriptionService.getCurrentSubscription(),
          subscriptionService.getSubscriptionHistory().catch(() => []),
        ])
        setSub(currentSub)
        setHistory(subHistory)
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
              {t('mySubscription.backToLessons')}
            </Link>

            <h1 className="progress-hero-title">{t('mySubscription.title')}</h1>
            <p className="progress-hero-subtitle">
              {t('mySubscription.subtitle')}
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
              <p>{t('mySubscription.loading')}</p>
            </div>
          ) : (
            <>
              <div className="admin-card" style={{ padding: '32px', borderRadius: '24px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <span className={`badge-pill ${sub?.plan_id === 'free' ? 'badge-draft' : 'badge-active'}`} style={{ marginBottom: '8px', display: 'inline-block' }}>
                      {sub?.isPremium ? t('mySubscription.upgradedBadge') : t('mySubscription.freeBadge')}
                    </span>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {sub?.plan_name || t('mySubscription.freePlan')}
                    </h2>
                  </div>

                  <button
                    className="btn-admin-primary"
                    onClick={() => navigate('/pricing')}
                    style={{ padding: '12px 24px', borderRadius: '9999px' }}
                  >
                    {t('mySubscription.upgradeOrChangeBtn')}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>{t('mySubscription.planStatusLabel')}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: sub?.isPremium ? '#16a34a' : '#64748b', textTransform: 'uppercase', marginTop: '2px' }}>
                      ● {sub?.status || 'Active'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>{t('mySubscription.expiryDateLabel')}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                      {sub?.end_date ? new Date(sub.end_date).toLocaleDateString() : t('mySubscription.unlimited')}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>{t('mySubscription.allowedFeaturesLabel')}</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#2a63e8', marginTop: '2px' }}>
                      {sub?.features && sub.features.length > 0 ? sub.features.join(', ') : t('mySubscription.basicLearning')}
                    </div>
                  </div>
                </div>
              </div>

              {history.length > 0 && (
                <div className="admin-card" style={{ padding: '28px', borderRadius: '24px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                    {t('mySubscription.historyTitle')}
                  </h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {history.map((item, idx) => (
                      <div
                        key={item.subscription?._id || idx}
                        style={{
                          padding: '16px',
                          borderRadius: '12px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '12px',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>
                            {t('mySubscription.planPrefix')} {typeof item.subscription?.planId === 'object' ? item.subscription.planId.name : item.subscription?.planId || 'Premium'}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                            {t('mySubscription.periodPrefix')} {new Date(item.subscription?.startDate).toLocaleDateString()} - {new Date(item.subscription?.endDate).toLocaleDateString()}
                          </div>
                        </div>
                        <span className={`badge-pill ${item.subscription?.status === 'active' ? 'badge-active' : 'badge-draft'}`}>
                          {item.subscription?.status === 'active' ? t('mySubscription.statusActive') : t('mySubscription.statusEnded')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default SubscriptionPage
