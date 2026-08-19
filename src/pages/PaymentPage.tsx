import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { subscriptionService } from '../services/subscriptionService'
import type { CreateOrderResponse } from '../types/gamification'
import { toast } from 'react-hot-toast'
import '../styles/pages/pricing.css'

export const PaymentPage: React.FC = () => {
  const { planId, orderId } = useParams<{ planId?: string; orderId?: string }>()
  const idParam = orderId || planId || 'premium'
  const navigate = useNavigate()
  const location = useLocation()

  const [orderData, setOrderData] = useState<CreateOrderResponse | null>(
    (location.state as CreateOrderResponse) || null
  )
  const [loading, setLoading] = useState(!orderData)
  const [checkingStatus, setCheckingStatus] = useState(false)

  // Initial load: create order or fetch existing order details
  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      if (orderData) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        let res: CreateOrderResponse
        if (idParam.startsWith('DUMS') || idParam.startsWith('ord_') || idParam.length > 10) {
          res = await subscriptionService.getOrder(idParam)
        } else {
          res = await subscriptionService.createOrder(idParam)
        }
        if (isMounted) {
          setOrderData(res)
        }
      } catch (err: any) {
        if (isMounted) {
          toast.error(err.message || 'Không thể tải thông tin đơn hàng.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [idParam])

  // Process payment success: Toast -> GET /api/subscriptions/current -> isPremium = true -> Navigate -> Dashboard
  const handlePaymentSuccess = async () => {
    toast.success('Thanh toán thành công!')

    try {
      // GET /api/subscriptions/current
      const sub = await subscriptionService.getCurrentSubscription()
      const isPremium = sub.plan_id !== 'free' && sub.status === 'active'
      console.log('Current subscription updated:', sub, 'isPremium:', isPremium)
    } catch (err) {
      console.warn('Error updating current subscription:', err)
    }

    // Navigate → Dashboard (/levels)
    navigate('/levels', { state: { paymentSuccess: true } })
  }

  // Phase 4: Polling GET /api/orders/:id every 3 seconds
  useEffect(() => {
    if (!orderData?.order.id && !orderData?.order.orderCode) return

    const targetId = orderData.order.id || orderData.order.orderCode
    let isCancelled = false

    const interval = setInterval(async () => {
      try {
        // GET /api/orders/:id
        const { status, isPaid } = await subscriptionService.getOrderStatus(targetId)
        if (isCancelled) return

        if (isPaid) {
          clearInterval(interval)
          await handlePaymentSuccess()
        } else if (status !== orderData.order.status) {
          setOrderData((prev) =>
            prev
              ? {
                  ...prev,
                  order: { ...prev.order, status },
                }
              : null
          )
        }
      } catch (err) {
        console.warn('Status polling error (GET /api/orders/:id):', err)
      }
    }, 3000) // 3 seconds interval

    return () => {
      isCancelled = true
      clearInterval(interval)
    }
  }, [orderData?.order.id, orderData?.order.orderCode])

  const copyTransferContent = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('Đã sao chép nội dung chuyển khoản!')
  }

  // Manual check when user clicks "[Tôi đã thanh toán]"
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
    } catch (err: any) {
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

      <main className="pricing-main-section" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
        <div className="pricing-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div className="admin-spinner" style={{ margin: '0 auto 16px auto' }}></div>
              <p>Đang tải thông tin thanh toán...</p>
            </div>
          ) : orderData ? (
            <div className="payment-card-container">
              {/* Header Title */}
              <h1 className="payment-card-title">
                Thanh toán {orderData.order.planName || 'Premium'}
              </h1>

              {/* Amount */}
              <div className="payment-card-amount">
                {formatPrice(orderData.order.amount)}
              </div>

              {/* QR Code */}
              {orderData.payment.qrCodeUrl && (
                <div className="payment-qr-wrapper">
                  <img
                    src={orderData.payment.qrCodeUrl}
                    alt="Mã QR Thanh Toán"
                    className="payment-qr-image"
                  />
                </div>
              )}

              {/* Bank Account Details Table */}
              <table className="payment-info-table">
                <tbody>
                  <tr>
                    <td className="label">Ngân hàng</td>
                    <td className="value">{orderData.payment.bankName || 'Techcombank'}</td>
                  </tr>
                  <tr>
                    <td className="label">Số tài khoản</td>
                    <td className="value">{orderData.payment.accountNumber}</td>
                  </tr>
                  <tr>
                    <td className="label">Chủ tài khoản</td>
                    <td className="value">{orderData.payment.accountName}</td>
                  </tr>
                </tbody>
              </table>

              {/* Transfer Content Section with Copy button */}
              <div className="transfer-content-box">
                <div className="transfer-content-header">Nội dung</div>
                <div className="transfer-content-row">
                  <span className="transfer-content-code">
                    {orderData.payment.transferContent}
                  </span>
                  <button
                    type="button"
                    className="btn-copy-code"
                    onClick={() => copyTransferContent(orderData.payment.transferContent)}
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Status Indicator (Backend PENDING -> webhook -> PAID) */}
              <div className="payment-status-wrapper">
                <div className="spinner-pulse"></div>
                <span>Đang chờ thanh toán...</span>
              </div>

              {/* Action Button */}
              <button
                type="button"
                className="btn-i-paid"
                disabled={checkingStatus}
                onClick={handleCheckPaymentStatus}
              >
                {checkingStatus ? 'Đang kiểm tra...' : '[Tôi đã thanh toán]'}
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Không tìm thấy thông tin đơn hàng.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default PaymentPage
