import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'
import { subscriptionService } from '../services/subscriptionService'
import type { CreateOrderResponse } from '../types/gamification'
import { toast } from 'react-hot-toast'
import { getBankDisplayName } from '../utils/bankHelper'
import cloudSvg from '../assets/Cloud.svg'
import '../styles/pages/pricing.css'

export const PaymentPage: React.FC = () => {
  const { t } = useTranslation('payment')
  const { planId, orderId } = useParams<{ planId?: string; orderId?: string }>()
  const targetOrderId = orderId || planId || ''
  const navigate = useNavigate()
  const location = useLocation()
  const { refreshUser } = useAuth()

  const [orderData, setOrderData] = useState<CreateOrderResponse | null>(
    (location.state as CreateOrderResponse) || null
  )
  const [loading, setLoading] = useState(!orderData && Boolean(targetOrderId))
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60) // 15 minutes countdown

  const isTerminalStatus = useCallback((status?: string) => {
    const s = (status || '').toUpperCase()
    return s === 'PAID' || s === 'SUCCESS' || s === 'COMPLETED' || s === 'CANCELLED' || s === 'FAILED' || s === 'EXPIRED'
  }, [])

  // Initial load: fetch existing order details by targetOrderId
  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      if (orderData) {
        setLoading(false)
        return
      }

      if (!targetOrderId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const res = await subscriptionService.getOrder(targetOrderId)
        if (isMounted) {
          setOrderData(res)
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : t('checkout.orderNotFound')
          toast.error(msg)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      isMounted = false
    }
  }, [targetOrderId, orderData, t])

  // Process payment success
  const handlePaymentSuccess = useCallback(async () => {
    toast.success(t('checkout.paymentSuccessToast'))

    try {
      await refreshUser()
      await subscriptionService.getCurrentSubscription()
    } catch (err: unknown) {
      console.warn('Error refreshing user subscription:', err)
    }

    navigate('/payment/result', {
      state: {
        status: 'success',
        planName: orderData?.order.planName || 'Premium',
      },
    })
  }, [navigate, orderData?.order.planName, refreshUser, t])

  // Countdown timer for 15 minutes
  const orderStatus = orderData?.order.status?.toUpperCase()
  useEffect(() => {
    if (isTerminalStatus(orderStatus)) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setOrderData((curr) =>
            curr
              ? {
                  ...curr,
                  order: { ...curr.order, status: 'EXPIRED' },
                }
              : null
          )
          toast.error(t('checkout.orderExpired'))
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isTerminalStatus, orderStatus, t])

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Polling GET /api/orders/:id every 3 seconds
  const pollingRef = useRef(false)
  useEffect(() => {
    if (!orderData?.order.id && !orderData?.order.orderCode) return
    const currentStatus = orderData?.order.status?.toUpperCase()
    if (isTerminalStatus(currentStatus)) return

    const targetId = orderData.order.id || orderData.order.orderCode
    let isCancelled = false

    const interval = setInterval(async () => {
      if (pollingRef.current) return
      try {
        pollingRef.current = true
        const { status, isPaid } = await subscriptionService.getOrderStatus(targetId)
        if (isCancelled) return

        const upperStatus = status.toUpperCase()
        if (isPaid) {
          clearInterval(interval)
          await handlePaymentSuccess()
        } else if (upperStatus === 'CANCELLED' || upperStatus === 'FAILED' || upperStatus === 'EXPIRED') {
          clearInterval(interval)
          setOrderData((prev) =>
            prev
              ? {
                  ...prev,
                  order: { ...prev.order, status: upperStatus },
                }
              : null
          )
        } else if (upperStatus !== currentStatus) {
          setOrderData((prev) =>
            prev
              ? {
                  ...prev,
                  order: { ...prev.order, status: upperStatus },
                }
              : null
          )
        }
      } catch (err: unknown) {
        console.warn('Status polling error (GET /api/orders/:id):', err)
      } finally {
        pollingRef.current = false
      }
    }, 3000)

    return () => {
      isCancelled = true
      clearInterval(interval)
    }
  }, [orderData?.order.id, orderData?.order.orderCode, orderData?.order.status, handlePaymentSuccess, isTerminalStatus])

  const copyToClipboard = (text: string, fieldName: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    toast.success(`${t('checkout.copied')} ${label}!`)
    setTimeout(() => {
      setCopiedField(null)
    }, 2000)
  }

  const handleCheckPaymentStatus = async () => {
    if (!orderData) return
    const targetId = orderData.order.id || orderData.order.orderCode

    try {
      setCheckingStatus(true)
      const { status, isPaid } = await subscriptionService.getOrderStatus(targetId)

      if (isPaid) {
        await handlePaymentSuccess()
      } else if (status === 'EXPIRED' || status === 'CANCELLED' || status === 'FAILED') {
        setOrderData((prev) =>
          prev
            ? {
                ...prev,
                order: { ...prev.order, status },
              }
            : null
        )
      } else {
        toast(t('checkout.waitingWebhookToast'), {
          icon: '⏳',
          duration: 3000,
        })
      }
    } catch {
      toast.error(t('checkout.checkStatusError'))
    } finally {
      setCheckingStatus(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!orderData) return
    const targetId = orderData.order.id || orderData.order.orderCode

    try {
      setIsCancelling(true)
      await subscriptionService.cancelOrder(targetId)
      toast.success(t('checkout.orderCancelled'))
      setOrderData((prev) =>
        prev
          ? {
              ...prev,
              order: { ...prev.order, status: 'CANCELLED' },
            }
          : null
      )
    } catch {
      toast.error('Không thể hủy đơn hàng vào lúc này.')
    } finally {
      setIsCancelling(false)
    }
  }

  const formatPrice = (price: number) => {
    if (price === 0) return '0đ'
    return `${price.toLocaleString('vi-VN')}đ`
  }

  const isExpired = orderData?.order.status?.toUpperCase() === 'EXPIRED'
  const isCancelled = orderData?.order.status?.toUpperCase() === 'CANCELLED'

  return (
    <div className="pricing-page">
      <Header />

      <main className="payment-page-main">
        {/* Floating Clouds Background Decor */}
        <img src={cloudSvg} alt="" className="payment-decor-cloud payment-decor-cloud--left" aria-hidden="true" />
        <img src={cloudSvg} alt="" className="payment-decor-cloud payment-decor-cloud--right" aria-hidden="true" />

        <div className="payment-container">
          <div className="payment-header-section">
            <h1 className="payment-page-title">
              {t('checkout.title', { name: orderData?.order.planName || 'Premium' })}
            </h1>
            <p className="payment-page-subtitle">
              {t('checkout.subtitle')}
            </p>
          </div>

          {loading ? (
            <div className="payment-state-card">
              <div className="payment-spinner"></div>
              <p style={{ color: '#0F274D', fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>
                {t('checkout.loading')}
              </p>
            </div>
          ) : orderData ? (
            <div className="payment-main-card">
              <div className="payment-grid-layout">
                {/* Left Column: QR Code & Plan Amount */}
                <div className="payment-col-qr">
                  <div className="payment-plan-badge">
                    <span>{t('checkout.planBadge', { name: orderData.order.planName || 'PREMIUM' })}</span>
                  </div>

                  <div className="payment-amount-display">
                    {formatPrice(orderData.order.amount)}
                  </div>

                  {orderData.payment.qrCodeUrl && !isExpired && !isCancelled && (
                    <div className="payment-qr-card">
                      <img
                        src={orderData.payment.qrCodeUrl}
                        alt="Mã QR Thanh Toán VietQR"
                        className="payment-qr-img"
                      />
                      <div className="payment-qr-instruction">
                        <span>📱</span> {t('checkout.openBankingApp')}
                      </div>
                    </div>
                  )}

                  {/* Expiry / Cancelled Notice */}
                  {isExpired && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center font-medium my-4">
                      {t('checkout.orderExpired')}
                    </div>
                  )}

                  {isCancelled && (
                    <div className="bg-gray-100 border border-gray-300 text-gray-700 p-4 rounded-xl text-center font-medium my-4">
                      {t('checkout.orderCancelled')}
                    </div>
                  )}

                  {/* Countdown timer */}
                  {!isExpired && !isCancelled && (
                    <div className="text-center text-sm font-semibold text-gray-600 mt-2">
                      ⏱️ Thời gian giữ đơn: <span className="text-red-600 font-bold">{formatTimer(timeLeft)}</span>
                    </div>
                  )}
                </div>

                {/* Right Column: Details & Actions */}
                <div className="payment-col-info">
                  <h2 className="payment-info-header">{t('checkout.bankInfoTitle')}</h2>

                  <div className="payment-details-list">
                    <div className="payment-detail-row">
                      <span className="payment-detail-label">{t('checkout.bankName')}</span>
                      <span className="payment-detail-value">
                        {getBankDisplayName(orderData.payment.bankName)}
                      </span>
                    </div>

                    <div className="payment-detail-row">
                      <span className="payment-detail-label">{t('checkout.accountNumber')}</span>
                      <div className="payment-detail-value">
                        <span>{orderData.payment.accountNumber}</span>
                        <button
                          type="button"
                          className="payment-btn-copy payment-btn-copy--sm"
                          onClick={() => copyToClipboard(orderData.payment.accountNumber, 'accountNumber', t('checkout.accountNumber'))}
                        >
                          {copiedField === 'accountNumber' ? t('checkout.copied') : t('checkout.copy')}
                        </button>
                      </div>
                    </div>

                    <div className="payment-detail-row">
                      <span className="payment-detail-label">{t('checkout.accountName')}</span>
                      <span className="payment-detail-value">
                        {orderData.payment.accountName}
                      </span>
                    </div>
                  </div>

                  {/* Transfer Content Warning Box */}
                  <div className="payment-transfer-box">
                    <div className="payment-transfer-label">
                      <span>⚠️</span> {t('checkout.transferWarning')}
                    </div>
                    <div className="payment-transfer-content-wrapper">
                      <span className="payment-transfer-code">
                        {orderData.payment.transferContent}
                      </span>
                      <button
                        type="button"
                        className="payment-btn-copy"
                        onClick={() => copyToClipboard(orderData.payment.transferContent, 'transferContent', 'nội dung chuyển khoản')}
                      >
                        {copiedField === 'transferContent' ? t('checkout.copiedContent') : t('checkout.copyContent')}
                      </button>
                    </div>
                  </div>

                  {/* Live Polling Status */}
                  {!isExpired && !isCancelled && (
                    <div className="payment-status-badge">
                      <div className="payment-status-dot"></div>
                      <span>{t('checkout.waitingStatus')}</span>
                    </div>
                  )}

                  {/* Manual Check Button */}
                  {!isExpired && !isCancelled && (
                    <button
                      type="button"
                      className="payment-btn-submit"
                      disabled={checkingStatus}
                      onClick={handleCheckPaymentStatus}
                    >
                      {checkingStatus ? t('checkout.checkingStatus') : t('checkout.checkStatusBtn')}
                    </button>
                  )}

                  {/* Cancel Order Button */}
                  {!isExpired && !isCancelled && (
                    <button
                      type="button"
                      className="w-full text-center text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors py-2"
                      disabled={isCancelling}
                      onClick={handleCancelOrder}
                    >
                      {isCancelling ? 'Đang hủy đơn...' : t('checkout.cancelOrderBtn')}
                    </button>
                  )}

                  <div style={{ textAlign: 'center', marginTop: '10px' }}>
                    <button
                      type="button"
                      className="payment-back-link"
                      onClick={() => navigate('/pricing')}
                    >
                      {t('checkout.backToPricing')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="payment-state-card">
              <p style={{ color: '#475569', fontSize: '1.05rem', marginBottom: '20px' }}>
                {t('checkout.orderNotFound')}
              </p>
              <button
                type="button"
                className="payment-btn-submit"
                style={{ maxWidth: '240px', margin: '0 auto', fontSize: '1rem', padding: '12px 20px' }}
                onClick={() => navigate('/pricing')}
              >
                {t('checkout.returnToPricing')}
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default PaymentPage
