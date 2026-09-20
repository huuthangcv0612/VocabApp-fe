import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { subscriptionService } from '../services/subscriptionService'
import type { CreateOrderResponse } from '../types/gamification'
import { toast } from 'react-hot-toast'
import { getBankDisplayName } from '../utils/bankHelper'
import cloudSvg from '../assets/Cloud.svg'
import '../styles/pages/pricing.css'

export const PaymentPage: React.FC = () => {
  const { planId, orderId } = useParams<{ planId?: string; orderId?: string }>()
  const targetOrderId = orderId || planId || ''
  const navigate = useNavigate()
  const location = useLocation()

  const [orderData, setOrderData] = useState<CreateOrderResponse | null>(
    (location.state as CreateOrderResponse) || null
  )
  const [loading, setLoading] = useState(!orderData && Boolean(targetOrderId))
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

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
          const msg = err instanceof Error ? err.message : 'Không thể tải thông tin đơn hàng.'
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
  }, [targetOrderId, orderData])

  // Process payment success
  const handlePaymentSuccess = useCallback(async () => {
    toast.success('Thanh toán thành công!')

    try {
      const sub = await subscriptionService.getCurrentSubscription()
      const isPremium = sub.plan_id !== 'free' && sub.status === 'active'
      console.log('Current subscription updated:', sub, 'isPremium:', isPremium)
    } catch (err: unknown) {
      console.warn('Error updating current subscription:', err)
    }

    navigate('/levels', { state: { paymentSuccess: true } })
  }, [navigate])

  // Polling GET /api/orders/:id every 3 seconds
  useEffect(() => {
    if (!orderData?.order.id && !orderData?.order.orderCode) return

    const targetId = orderData.order.id || orderData.order.orderCode
    const currentOrderStatus = orderData.order.status
    let isCancelled = false

    const interval = setInterval(async () => {
      try {
        const { status, isPaid } = await subscriptionService.getOrderStatus(targetId)
        if (isCancelled) return

        if (isPaid) {
          clearInterval(interval)
          await handlePaymentSuccess()
        } else if (status !== currentOrderStatus) {
          setOrderData((prev) =>
            prev
              ? {
                  ...prev,
                  order: { ...prev.order, status },
                }
              : null
          )
        }
      } catch (err: unknown) {
        console.warn('Status polling error (GET /api/orders/:id):', err)
      }
    }, 3000)

    return () => {
      isCancelled = true
      clearInterval(interval)
    }
  }, [orderData?.order.id, orderData?.order.orderCode, orderData?.order.status, handlePaymentSuccess])

  const copyToClipboard = (text: string, fieldName: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    toast.success(`Đã sao chép ${label}!`)
    setTimeout(() => {
      setCopiedField(null)
    }, 2000)
  }

  const handleCheckPaymentStatus = async () => {
    if (!orderData) return
    const targetId = orderData.order.id || orderData.order.orderCode

    try {
      setCheckingStatus(true)
      const { isPaid } = await subscriptionService.getOrderStatus(targetId)

      if (isPaid) {
        await handlePaymentSuccess()
      } else {
        toast('Hệ thống đang chờ ngân hàng xác nhận giao dịch (webhook)... Vui lòng đợi trong giây lát.', {
          icon: '⏳',
          duration: 3000,
        })
      }
    } catch (err: unknown) {
      toast.error('Không thể kiểm tra trạng thái thanh toán. Thử lại sau.')
    } finally {
      setCheckingStatus(false)
    }
  }

  const formatPrice = (price: number) => {
    if (price === 0) return '0đ'
    return `${price.toLocaleString('vi-VN')}đ`
  }

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
              Thanh Toán {orderData?.order.planName || 'Premium'}
            </h1>
            <p className="payment-page-subtitle">
              Quét mã VietQR hoặc chuyển khoản theo thông tin bên dưới để kích hoạt gói dịch vụ DeutschUp
            </p>
          </div>

          {loading ? (
            <div className="payment-state-card">
              <div className="payment-spinner"></div>
              <p style={{ color: '#0F274D', fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>
                Đang tải thông tin thanh toán...
              </p>
            </div>
          ) : orderData ? (
            <div className="payment-main-card">
              <div className="payment-grid-layout">
                {/* Left Column: QR Code & Plan Amount */}
                <div className="payment-col-qr">
                  <div className="payment-plan-badge">
                    <span>⚡ GÓI {orderData.order.planName || 'PREMIUM'}</span>
                  </div>

                  <div className="payment-amount-display">
                    {formatPrice(orderData.order.amount)}
                  </div>

                  {orderData.payment.qrCodeUrl && (
                    <div className="payment-qr-card">
                      <img
                        src={orderData.payment.qrCodeUrl}
                        alt="Mã QR Thanh Toán VietQR"
                        className="payment-qr-img"
                      />
                      <div className="payment-qr-instruction">
                        <span>📱</span> Mở app ngân hàng để quét mã QR
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Details & Actions */}
                <div className="payment-col-info">
                  <h2 className="payment-info-header">Thông tin chuyển khoản</h2>

                  <div className="payment-details-list">
                    <div className="payment-detail-row">
                      <span className="payment-detail-label">Ngân hàng</span>
                      <span className="payment-detail-value">
                        {getBankDisplayName(orderData.payment.bankName)}
                      </span>
                    </div>

                    <div className="payment-detail-row">
                      <span className="payment-detail-label">Số tài khoản</span>
                      <div className="payment-detail-value">
                        <span>{orderData.payment.accountNumber}</span>
                        <button
                          type="button"
                          className="payment-btn-copy payment-btn-copy--sm"
                          onClick={() => copyToClipboard(orderData.payment.accountNumber, 'accountNumber', 'số tài khoản')}
                        >
                          {copiedField === 'accountNumber' ? '✓ Đã chép' : '📋 Copy'}
                        </button>
                      </div>
                    </div>

                    <div className="payment-detail-row">
                      <span className="payment-detail-label">Chủ tài khoản</span>
                      <span className="payment-detail-value">
                        {orderData.payment.accountName}
                      </span>
                    </div>
                  </div>

                  {/* Transfer Content Warning Box */}
                  <div className="payment-transfer-box">
                    <div className="payment-transfer-label">
                      <span>⚠️</span> Nội dung chuyển khoản (Bắt buộc chính xác):
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
                        {copiedField === 'transferContent' ? '✓ Đã sao chép' : '📋 Sao chép nội dung'}
                      </button>
                    </div>
                  </div>

                  {/* Live Polling Status */}
                  <div className="payment-status-badge">
                    <div className="payment-status-dot"></div>
                    <span>Đang chờ hệ thống ghi nhận thanh toán...</span>
                  </div>

                  {/* Manual Check Button */}
                  <button
                    type="button"
                    className="payment-btn-submit"
                    disabled={checkingStatus}
                    onClick={handleCheckPaymentStatus}
                  >
                    {checkingStatus ? 'ĐANG KIỂM TRA...' : 'TÔI ĐÃ THANH TOÁN'}
                  </button>

                  <div style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      className="payment-back-link"
                      onClick={() => navigate('/pricing')}
                    >
                      ← Quay lại chọn gói khác
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="payment-state-card">
              <p style={{ color: '#475569', fontSize: '1.05rem', marginBottom: '20px' }}>
                Không tìm thấy thông tin đơn hàng thanh toán.
              </p>
              <button
                type="button"
                className="payment-btn-submit"
                style={{ maxWidth: '240px', margin: '0 auto', fontSize: '1rem', padding: '12px 20px' }}
                onClick={() => navigate('/pricing')}
              >
                Quay lại bảng giá
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

