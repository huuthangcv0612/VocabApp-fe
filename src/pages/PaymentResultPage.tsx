import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { subscriptionService } from '../services/subscriptionService'
import CloudIcon from '../assets/Cloud.svg'
import '../styles/pages/progress.css'

export const PaymentResultPage: React.FC = () => {
  const { t } = useTranslation(['payment', 'common'])
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const state = (location.state as { status?: string; planName?: string }) || {}
  const [isSuccess, setIsSuccess] = useState<boolean>(state.status === 'success' || searchParams.get('status') === 'success')
  const [planName, setPlanName] = useState<string>(state.planName || searchParams.get('plan') || 'PREMIUM')
  const [checking, setChecking] = useState<boolean>(!state.status && !searchParams.get('status'))

  useEffect(() => {
    // If user refreshed and location.state was cleared, check active subscription
    if (!state.status && !searchParams.get('status')) {
      subscriptionService.getCurrentSubscription()
        .then((sub) => {
          if (sub.isPremium && sub.status === 'active') {
            setIsSuccess(true)
            setPlanName(sub.plan_name)
          } else {
            setIsSuccess(false)
          }
        })
        .catch(() => {
          setIsSuccess(false)
        })
        .finally(() => {
          setChecking(false)
        })
    }
  }, [state.status, searchParams])

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
              {t('result.backToProfile')}
            </Link>

            <h1 className="progress-hero-title">{t('result.heroTitle')}</h1>
            <p className="progress-hero-subtitle">
              {t('result.heroSubtitle')}
            </p>
          </div>
        </div>

        <div className="progress-hero-wave"></div>
      </section>

      {/* Main Content Section */}
      <main className="progress-main-section" style={{ padding: '40px 20px 80px 20px' }}>
        <div className="progress-container" style={{ maxWidth: '600px' }}>
          <div className="admin-card" style={{ padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
            {checking ? (
              <div style={{ padding: '30px 0' }}>
                <div className="admin-spinner" style={{ margin: '0 auto 16px auto' }}></div>
                <p>{t('checkout.checkingStatus')}</p>
              </div>
            ) : (
              <>
                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>{isSuccess ? '🎉' : '❌'}</div>

                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: isSuccess ? '#15803d' : '#b91c1c', margin: '0 0 12px 0' }}>
                  {isSuccess ? t('result.successHeading') : t('result.failedHeading')}
                </h2>

                <p style={{ color: '#475569', fontSize: '1rem', marginBottom: '32px', lineHeight: 1.6 }}>
                  {isSuccess
                    ? t('result.successDesc', { name: planName })
                    : t('result.failedDesc')}
                </p>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {isSuccess ? (
                    <>
                      <button
                        className="btn-admin-secondary"
                        style={{ padding: '12px 24px', borderRadius: '9999px' }}
                        onClick={() => navigate('/subscription')}
                      >
                        {t('result.viewSubscription')}
                      </button>

                      <button
                        className="btn-admin-primary"
                        style={{ padding: '12px 28px', borderRadius: '9999px', backgroundColor: '#16a34a' }}
                        onClick={() => navigate('/levels')}
                      >
                        {t('result.startAdvancedLearning')}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn-admin-secondary"
                        style={{ padding: '12px 24px', borderRadius: '9999px' }}
                        onClick={() => navigate('/pricing')}
                      >
                        {t('result.backToPricing')}
                      </button>

                      <button
                        className="btn-admin-primary"
                        style={{ padding: '12px 28px', borderRadius: '9999px' }}
                        onClick={() => navigate('/subscription')}
                      >
                        {t('result.tryAgainLater')}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default PaymentResultPage
