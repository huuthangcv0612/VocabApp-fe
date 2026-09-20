import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'
import { subscriptionService } from '../services/subscriptionService'
import type { Plan } from '../types/plan'
import '../styles/pages/pricing.css'

const normalizePlanType = (value: unknown): string | null => {
  if (typeof value === 'string') {
    return value.trim().toUpperCase() || null
  }

  if (value && typeof value === 'object') {
    const candidate = value as { planType?: string; name?: string }
    const rawType = candidate.planType ?? candidate.name
    if (typeof rawType === 'string') {
      return rawType.trim().toUpperCase() || null
    }
  }

  return null
}

const formatPlanPrice = (plan: Plan): string => {
  if (plan.planType === 'FREE') return 'Free'
  if (plan.price === 0) return plan.planType === 'CUSTOM' ? 'Contact us' : 'Free'
  return Number(plan.price).toLocaleString()
}

const formatPlanDuration = (plan: Plan): string => {
  if (plan.planType === 'FREE') return ''
  if (plan.durationDays === 30 || plan.durationDays === 31) return '/ month'
  if (plan.durationDays > 0) return ` / ${plan.durationDays} days`
  return ''
}

const getPlanSummary = (plan: Plan): string => {
  if (plan.planType === 'FREE') return 'Basic vocabulary learning'
  if (plan.planType === 'PREMIUM') return 'Learn German with AI'
  return 'For teachers & organizations'
}

const sortPlans = (plans: Plan[]) => {
  const order = { FREE: 0, PREMIUM: 1, CUSTOM: 2 }

  return [...plans]
    .filter((plan) => plan.isActive !== false)
    .sort((a, b) => {
      const typeOrderA = order[a.planType] ?? 99
      const typeOrderB = order[b.planType] ?? 99
      if (typeOrderA !== typeOrderB) return typeOrderA - typeOrderB
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    })
}

export const PricingPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purchasingPlanId, setPurchasingPlanId] = useState<string | null>(null)

  const currentUserPlan = useMemo(() => {
    return normalizePlanType(user?.plan) ?? null
  }, [user?.plan])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      setError(null)
      const planList = await subscriptionService.getPlans()
      setPlans(sortPlans(planList))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to load plans.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchPlans()
  }, [])

  const handlePlanAction = async (plan: Plan) => {
    const isCurrentPlan = currentUserPlan === plan.planType
    if (isCurrentPlan) return

    if (plan.planType === 'FREE') {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: '/pricing' } })
      }
      return
    }

    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/pricing' } })
      return
    }

    if (plan.planType === 'PREMIUM' || plan.planType === 'CUSTOM') {
      try {
        setPurchasingPlanId(plan._id)
        const orderRes = await subscriptionService.createOrder(plan._id)
        const orderId = orderRes.order?.id || orderRes.order?.orderCode

        if (!orderId) {
          throw new Error('No order was returned by the backend.')
        }

        navigate(`/payment/${orderId}`, { state: orderRes })
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unable to create order. Please try again.'
        toast.error(msg)
      } finally {
        setPurchasingPlanId(null)
      }
    }
  }

  const getCtaLabel = (plan: Plan) => {
    const isCurrentPlan = currentUserPlan === plan.planType
    return isCurrentPlan ? `You're on ${plan.name}` : `Get ${plan.name}`
  }

  return (
    <div className="pricing-page">
      <Header />

      <section className="pricing-hero-section">
        <div className="pricing-hero-container">
          <div className="pricing-hero-title-wrap">
            <h1 className="pricing-hero-title">Pricing</h1>
          </div>
          <p className="pricing-hero-subtitle">Choose your learning plan</p>
        </div>
      </section>

      <main className="pricing-main-section">
        <div className="pricing-container">
          {loading ? (
            <div className="pricing-state pricing-state--loading">
              <div className="pricing-spinner" />
              <p>Loading plans...</p>
            </div>
          ) : error ? (
            <div className="pricing-state pricing-state--error">
              <p>{error}</p>
              <button type="button" className="plan-button" onClick={() => void fetchPlans()}>
                Try again
              </button>
            </div>
          ) : plans.length === 0 ? (
            <div className="pricing-state pricing-state--empty">
              <p>No plans available.</p>
            </div>
          ) : (
            <div className="pricing-grid">
              {plans.map((plan) => {
                const isCurrentPlan = currentUserPlan === plan.planType
                const features = plan.features && plan.features.length > 0
                  ? plan.features
                  : [
                      'Vocabulary learning',
                      'Practice exercises',
                      'Progress tracking',
                    ]

                return (
                  <article
                    key={plan._id}
                    className={`plan-card plan-card--${plan.planType.toLowerCase()} ${isCurrentPlan ? 'is-current' : ''}`}
                  >
                    <div className="plan-card__header">
                      {isCurrentPlan ? (
                        <span className="plan-badge plan-badge--current">Current plan</span>
                      ) : (
                        <span className="plan-badge plan-badge--type">{getPlanSummary(plan)}</span>
                      )}

                      <h2 className="plan-title">{plan.name}</h2>

                      <div className="plan-price-block">
                        <span className="plan-price-value">{formatPlanPrice(plan)}</span>
                        {plan.planType !== 'FREE' && (
                          <span className="plan-price-unit">{formatPlanDuration(plan)}</span>
                        )}
                      </div>
                    </div>

                    <ul className="plan-features">
                      {features.map((feature, index) => (
                        <li key={`${plan._id}-${index}`} className="plan-feature-item">
                          <span className="feature-check">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      className={`plan-button ${isCurrentPlan ? 'plan-button--current' : 'plan-button--primary'}`}
                      disabled={isCurrentPlan || purchasingPlanId === plan._id}
                      onClick={() => {
                        void handlePlanAction(plan)
                      }}
                    >
                      {purchasingPlanId === plan._id ? 'Processing...' : getCtaLabel(plan)}
                    </button>
                  </article>
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
