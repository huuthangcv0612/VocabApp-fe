import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'
import { subscriptionService } from '../services/subscriptionService'
import type { Plan } from '../types/plan'
import CloudIcon from '../assets/Cloud.svg'
import '../styles/pages/pricing.css'

const formatDuration = (days: number): string => {
  if (days <= 0) return 'Vĩnh viễn'
  if (days === 30 || days === 31) return '1 tháng'
  if (days === 60) return '2 tháng'
  if (days === 90) return '3 tháng'
  if (days === 180) return '6 tháng'
  if (days === 365 || days === 366) return '1 năm'
  if (days % 30 === 0) {
    return `${Math.round(days / 30)} tháng`
  }
  return `${days} ngày`
}

export const PricingPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPremiumId, setSelectedPremiumId] = useState<string>('')
  const [purchasingPlanId, setPurchasingPlanId] = useState<string | null>(null)

  // Current user's plan as source of truth
  const currentUserPlan = useMemo(() => {
    if (!isAuthenticated || !user?.plan) return 'FREE'
    return String(user.plan).trim().toUpperCase()
  }, [isAuthenticated, user?.plan])

  const isAdmin = currentUserPlan === 'ADMIN'

  const fetchPlans = async () => {
    try {
      setLoading(true)
      setError(null)
      const planList = await subscriptionService.getPlans()
      setPlans(planList)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách gói dịch vụ.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchPlans()
  }, [])

  // Group plans by planType
  const freePlan = useMemo(() => {
    return plans.find((p) => p.planType === 'FREE')
  }, [plans])

  const premiumPlans = useMemo(() => {
    return plans
      .filter((p) => p.planType === 'PREMIUM')
      .sort((a, b) => a.durationDays - b.durationDays)
  }, [plans])

  const customPlan = useMemo(() => {
    return plans.find((p) => p.planType === 'CUSTOM')
  }, [plans])

  // Select initial default Premium plan (prefer 6 months / 180 days, or first available)
  useEffect(() => {
    if (premiumPlans.length > 0) {
      const exists = premiumPlans.some((p) => p._id === selectedPremiumId)
      if (!exists) {
        const defaultPlan = premiumPlans.find((p) => p.durationDays === 180) || premiumPlans[0]
        setSelectedPremiumId(defaultPlan._id)
      }
    }
  }, [premiumPlans, selectedPremiumId])

  const selectedPremiumPlan = useMemo(() => {
    return premiumPlans.find((p) => p._id === selectedPremiumId) || premiumPlans[0]
  }, [premiumPlans, selectedPremiumId])

  const formatPrice = (price: number) => {
    if (price === 0) return '0đ'
    return `${price.toLocaleString('vi-VN')}đ`
  }

  // Handle plan purchase / order creation
  const handleUpgrade = async (plan: Plan) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/pricing' } })
      return
    }

    if (isAdmin) {
      toast('Tài khoản Quản trị viên đã có đầy đủ đặc quyền trong hệ thống.', { icon: 'ℹ️' })
      return
    }

    // Do not create payment order for FREE
    if (plan.price === 0 || plan.planType === 'FREE') {
      return
    }

    try {
      setPurchasingPlanId(plan._id)
      const orderRes = await subscriptionService.createOrder(plan._id)
      const orderId = orderRes.order?.id || orderRes.order?.orderCode

      if (!orderId) {
        throw new Error('Không nhận được mã đơn hàng từ hệ thống.')
      }

      navigate(`/payment/${orderId}`, { state: orderRes })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể khởi tạo đơn hàng. Vui lòng thử lại.'
      toast.error(msg)
    } finally {
      setPurchasingPlanId(null)
    }
  }

  // Helper to determine CTA label and disabled state
  const getCtaConfig = (plan: Plan) => {
    if (!isAuthenticated) {
      if (plan.planType === 'FREE') {
        return { label: 'Bắt đầu miễn phí', disabled: false, isCurrent: false }
      }
      return { label: 'Nâng cấp ngay', disabled: false, isCurrent: false }
    }

    if (isAdmin) {
      return { label: 'Đặc quyền Quản trị viên', disabled: true, isCurrent: false }
    }

    const isCurrent = currentUserPlan === plan.planType

    if (isCurrent) {
      if (plan.planType === 'FREE') {
        return { label: 'Gói hiện tại', disabled: true, isCurrent: true }
      }
      if (plan.planType === 'PREMIUM') {
        return { label: 'Gia hạn gói này', disabled: false, isCurrent: true }
      }
      if (plan.planType === 'CUSTOM') {
        return { label: 'Gói hiện tại', disabled: true, isCurrent: true }
      }
    }

    if (currentUserPlan === 'FREE') {
      if (plan.planType === 'PREMIUM') {
        return { label: 'Nâng cấp ngay', disabled: false, isCurrent: false }
      }
      if (plan.planType === 'CUSTOM') {
        return { label: 'Đăng ký gói Giáo viên', disabled: false, isCurrent: false }
      }
    }

    if (currentUserPlan === 'PREMIUM') {
      if (plan.planType === 'FREE') {
        return { label: 'Gói cơ bản', disabled: true, isCurrent: false }
      }
      if (plan.planType === 'CUSTOM') {
        return { label: 'Đăng ký gói Giáo viên', disabled: false, isCurrent: false }
      }
    }

    if (currentUserPlan === 'CUSTOM') {
      return { label: 'Đã bao gồm quyền học', disabled: true, isCurrent: false }
    }

    return { label: 'Nâng cấp ngay', disabled: false, isCurrent: false }
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
          ) : error ? (
            <div className="pricing-error-container">
              <p style={{ color: '#DC2626', fontWeight: 700, fontSize: '1.05rem', marginBottom: '16px' }}>
                {error}
              </p>
              <button
                type="button"
                className="plan-action-button btn-upgrade"
                style={{ maxWidth: '200px', margin: '0 auto' }}
                onClick={() => void fetchPlans()}
              >
                Thử lại
              </button>
            </div>
          ) : plans.length === 0 ? (
            <div className="pricing-empty-container">
              <p style={{ color: '#64748B', fontSize: '1.05rem', margin: 0 }}>
                Hiện chưa có gói dịch vụ nào.
              </p>
            </div>
          ) : (
            <div className="pricing-grid">
              {/* 1. FREE PLAN CARD */}
              {freePlan && (() => {
                const cta = getCtaConfig(freePlan)
                const features =
                  freePlan.features && freePlan.features.length > 0
                    ? freePlan.features
                    : ['Học từ vựng theo chủ đề cơ bản', 'Luyện phát âm giọng chuẩn', 'Theo dõi tiến độ học tập']

                return (
                  <div
                    key={freePlan._id}
                    className={`pricing-card ${cta.isCurrent ? 'is-current' : ''}`}
                  >
                    <div>
                      {cta.isCurrent && <span className="plan-badge badge-current">ĐANG SỬ DỤNG</span>}
                      <h2 className="plan-title">{freePlan.name}</h2>
                      <div className="plan-price">
                        {formatPrice(freePlan.price)}
                        <span className="plan-duration-unit">/ {formatDuration(freePlan.durationDays)}</span>
                      </div>

                      <ul className="plan-features-list">
                        {features.map((feature, idx) => (
                          <li key={idx} className="plan-feature-item">
                            <span className="check-icon">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      className={`plan-action-button ${cta.disabled ? 'btn-current' : 'btn-upgrade'}`}
                      disabled={cta.disabled}
                      onClick={() => {
                        if (!isAuthenticated) {
                          navigate('/register')
                        }
                      }}
                    >
                      {cta.label}
                    </button>
                  </div>
                )
              })()}

              {/* 2. PREMIUM PLAN CARD (Grouped with duration selector) */}
              {selectedPremiumPlan && (() => {
                const cta = getCtaConfig(selectedPremiumPlan)
                const isCurrent = currentUserPlan === 'PREMIUM'
                const features =
                  selectedPremiumPlan.features && selectedPremiumPlan.features.length > 0
                    ? selectedPremiumPlan.features
                    : [
                        'Toàn bộ bài học và bài tập nâng cao',
                        'Trợ lý AI luyện giao tiếp phản xạ',
                        'Kiểm tra lỗi ngữ pháp câu bằng AI',
                        'Kho bài kiểm tra và thống kê chi tiết',
                      ]

                const isPurchasing = purchasingPlanId === selectedPremiumPlan._id

                return (
                  <div
                    key="premium-group-card"
                    className={`pricing-card is-highlighted ${isCurrent ? 'is-current' : ''}`}
                  >
                    <div>
                      <span className={`plan-badge ${isCurrent ? 'badge-current' : 'badge-popular'}`}>
                        {isCurrent ? 'ĐANG SỬ DỤNG' : 'PHỔ BIẾN NHẤT'}
                      </span>
                      <h2 className="plan-title">GÓI PREMIUM</h2>

                      {/* Premium Duration Selector Pills */}
                      {premiumPlans.length > 1 && (
                        <div className="duration-selector" role="tablist">
                          {premiumPlans.map((p) => {
                            const isSelected = p._id === selectedPremiumPlan._id
                            return (
                              <button
                                key={p._id}
                                type="button"
                                className={`duration-pill ${isSelected ? 'is-selected' : ''}`}
                                onClick={() => setSelectedPremiumId(p._id)}
                              >
                                {formatDuration(p.durationDays)}
                              </button>
                            )
                          })}
                        </div>
                      )}

                      <div className="plan-price">
                        {formatPrice(selectedPremiumPlan.price)}
                        <span className="plan-duration-unit">
                          / {formatDuration(selectedPremiumPlan.durationDays)}
                        </span>
                      </div>

                      <ul className="plan-features-list">
                        {features.map((feature, idx) => (
                          <li key={idx} className="plan-feature-item">
                            <span className="check-icon">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      className={`plan-action-button ${cta.disabled ? 'btn-current' : 'btn-upgrade'}`}
                      disabled={cta.disabled || isPurchasing}
                      onClick={() => !cta.disabled && handleUpgrade(selectedPremiumPlan)}
                    >
                      {isPurchasing ? 'Đang xử lý...' : cta.label}
                    </button>
                  </div>
                )
              })()}

              {/* 3. CUSTOM TEACHER PLAN CARD */}
              {customPlan && (() => {
                const cta = getCtaConfig(customPlan)
                const isCurrent = currentUserPlan === 'CUSTOM'
                const features =
                  customPlan.features && customPlan.features.length > 0
                    ? customPlan.features
                    : [
                        'Toàn bộ đặc quyền Gói Premium',
                        'Tạo và quản lý các lớp học tương tác',
                        'Tổ chức bài học Live & Trò chơi lớp học',
                        'Bảng điều khiển và phân tích học viên',
                      ]

                const isPurchasing = purchasingPlanId === customPlan._id

                return (
                  <div
                    key={customPlan._id}
                    className={`pricing-card ${isCurrent ? 'is-current' : ''}`}
                  >
                    <div>
                      <span className={`plan-badge ${isCurrent ? 'badge-current' : 'badge-teacher'}`}>
                        {isCurrent ? 'ĐANG SỬ DỤNG' : 'DÀNH CHO GIÁO VIÊN'}
                      </span>
                      <h2 className="plan-title">{customPlan.name}</h2>
                      <div className="plan-price">
                        {formatPrice(customPlan.price)}
                        {customPlan.durationDays > 0 && (
                          <span className="plan-duration-unit">
                            / {formatDuration(customPlan.durationDays)}
                          </span>
                        )}
                      </div>

                      <ul className="plan-features-list">
                        {features.map((feature, idx) => (
                          <li key={idx} className="plan-feature-item">
                            <span className="check-icon">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      className={`plan-action-button ${cta.disabled ? 'btn-current' : 'btn-upgrade'}`}
                      disabled={cta.disabled || isPurchasing}
                      onClick={() => !cta.disabled && handleUpgrade(customPlan)}
                    >
                      {isPurchasing ? 'Đang xử lý...' : cta.label}
                    </button>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default PricingPage
