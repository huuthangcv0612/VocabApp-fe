import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { subscriptionService } from '../services/subscriptionService'
import type { SubscriptionPackage, UserSubscription } from '../types/gamification'
import CloudIcon from '../assets/Cloud.svg'
import '../styles/pages/pricing.css'

export const PricingPage: React.FC = () => {
  const navigate = useNavigate()

  const [plans, setPlans] = useState<SubscriptionPackage[]>([])
  const [currentSub, setCurrentSub] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [planList, sub] = await Promise.all([
          subscriptionService.getPlans(),
          subscriptionService.getCurrentSubscription(),
        ])
        setPlans(planList)
        setCurrentSub(sub)
      } catch (err) {
        console.warn('Error fetching pricing plans:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const formatPrice = (price: number) => {
    if (price === 0) return '0đ'
    return `${price.toLocaleString('vi-VN')}đ`
  }

  const isCurrentPlan = (plan: SubscriptionPackage) => {
    if (plan.badge === 'isCurrent' || (plan as any).isCurrent !== undefined) {
      return Boolean((plan as any).isCurrent)
    }
    if (currentSub?.plan_id) {
      return currentSub.plan_id.toLowerCase() === plan.id.toLowerCase()
    }
    return plan.id.toLowerCase() === 'free' || plan.price === 0
  }

  const handleUpgrade = async (plan: SubscriptionPackage) => {
    try {
      const orderRes = await subscriptionService.createOrder(plan.id)
      const orderId = orderRes.order.id || orderRes.order.orderCode
      navigate(`/payment/${orderId}`, { state: orderRes })
    } catch (err) {
      navigate(`/payment/${plan.id}`)
    }
  }

  return (
    <div className="pricing-page">
      <Header />

      {/* Hero Banner */}
      <section className="pricing-hero-section">
        <img
          src={CloudIcon}
          alt=""
          className="hero-cloud cloud-1"
          style={{ position: 'absolute', top: '20px', left: '5%', opacity: 0.5, width: '120px' }}
        />
        <img
          src={CloudIcon}
          alt=""
          className="hero-cloud cloud-2"
          style={{ position: 'absolute', bottom: '20px', right: '5%', opacity: 0.5, width: '140px' }}
        />

        <div className="pricing-hero-container">
          <h1 className="pricing-hero-title">BẢNG GIÁ GÓI DỊCH VỤ</h1>
          <p className="pricing-hero-subtitle">
            Lựa chọn gói học tập phù hợp để tăng tốc khả năng tiếng Đức của bạn.
          </p>
        </div>
      </section>

      {/* Main Pricing Cards Grid */}
      <main className="pricing-main-section">
        <div className="pricing-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div className="admin-spinner" style={{ margin: '0 auto 16px auto' }}></div>
              <p>Đang tải các gói dịch vụ...</p>
            </div>
          ) : (
            <div className="pricing-grid">
              {plans.map((plan) => {
                const active = isCurrentPlan(plan)
                return (
                  <div
                    key={plan.id}
                    className={`pricing-card ${active ? 'is-current' : 'is-highlighted'}`}
                  >
                    <div>
                      <h2 className="plan-title">{plan.name}</h2>
                      <div className="plan-price">{formatPrice(plan.price)}</div>

                      <ul className="plan-features-list">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="plan-feature-item">
                            <span className="check-icon">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      className={`plan-action-button ${active ? 'btn-current' : 'btn-upgrade'}`}
                      disabled={active}
                      onClick={() => !active && handleUpgrade(plan)}
                    >
                      {active ? 'Gói hiện tại' : 'Nâng cấp ngay'}
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
