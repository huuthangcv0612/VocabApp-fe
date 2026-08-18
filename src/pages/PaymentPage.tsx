import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { subscriptionService } from '../services/subscriptionService'
import type { PaymentTransaction, SubscriptionPlanId } from '../types/gamification'
import { toast } from 'react-hot-toast'
import CloudIcon from '../assets/Cloud.svg'
import '../styles/pages/progress.css'

export const PaymentPage: React.FC = () => {
  const { planId } = useParams<{ planId: string }>()
  const validPlanId = (planId as SubscriptionPlanId) || 'premium'
  const navigate = useNavigate()

  const [paymentMethod, setPaymentMethod] = useState<'vietqr' | 'momo' | 'zalopay'>('vietqr')
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVerifying, setIsVerifying] = useState(false)

  const fetchPaymentTransaction = async () => {
    try {
      setLoading(true)
      const tx = await subscriptionService.createPayment(validPlanId, paymentMethod)
      setTransaction(tx)
    } catch (err: any) {
      toast.error(err.message || 'Không thể khởi tạo thanh toán.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPaymentTransaction()
  }, [validPlanId, paymentMethod])

  const handleVerifyClick = async () => {
    if (!transaction) return
    try {
      setIsVerifying(true)
      const result = await subscriptionService.verifyPayment(transaction._id, transaction.payment_code)
      if (result.verified) {
        toast.success('Xác minh thanh toán thành công! Gói dịch vụ đã được kích hoạt.')
        navigate('/payment/result', { state: { status: 'success', planName: validPlanId.toUpperCase() } })
      } else {
        toast.error('Hệ thống chưa nhận được thanh toán. Vui lòng thử lại sau.')
        navigate('/payment/result', { state: { status: 'failed' } })
      }
    } catch (err: any) {
      toast.error(err.message || 'Xác minh thanh toán thất bại.')
    } finally {
      setIsVerifying(false)
    }
  }

  const getPlanName = () => {
    if (validPlanId === 'premium') return 'Gói Premium (Chuyên Sâu)'
    if (validPlanId === 'pro') return 'Gói Pro VIP (Toàn Diện)'
    return 'Gói Free'
  }

  const getPlanPrice = () => {
    if (validPlanId === 'premium') return '199.000 VNĐ / tháng'
    if (validPlanId === 'pro') return '399.000 VNĐ / tháng'
    return '0 VNĐ'
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
            <Link to="/pricing" className="back-link">
              ← Chọn gói khác
            </Link>

            <h1 className="progress-hero-title">THANH TOÁN GÓI DỊCH VỤ</h1>
            <p className="progress-hero-subtitle">
              Quét mã VietQR / Chuyển khoản để kích hoạt gói dịch vụ. Gói sẽ được mở khóa ngay sau khi Backend xác minh giao dịch.
            </p>
          </div>
        </div>

        <div className="progress-hero-wave"></div>
      </section>

      {/* Main Content Section */}
      <main className="progress-main-section" style={{ padding: '40px 20px 80px 20px' }}>
        <div className="progress-container" style={{ maxWidth: '680px' }}>
          <div className="admin-card" style={{ padding: '36px', borderRadius: '24px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
              💳 Thông Tin Đơn Hàng: {getPlanName()}
            </h2>

            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Gói đăng ký:</span>
                <strong style={{ color: '#0f172a' }}>{getPlanName()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Thời hạn:</span>
                <strong style={{ color: '#0f172a' }}>1 Tháng</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>Tổng số tiền:</span>
                <strong style={{ fontSize: '1.2rem', color: '#2a63e8' }}>{getPlanPrice()}</strong>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '12px' }}>
                Chọn Phương Thức Thanh Toán:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                <button
                  type="button"
                  className="btn-admin-secondary"
                  style={{
                    border: paymentMethod === 'vietqr' ? '2px solid #2a63e8' : '1px solid #cbd5e1',
                    backgroundColor: paymentMethod === 'vietqr' ? '#eef2ff' : '#fff',
                    fontWeight: 700,
                  }}
                  onClick={() => setPaymentMethod('vietqr')}
                >
                  🏦 VietQR (Banking)
                </button>

                <button
                  type="button"
                  className="btn-admin-secondary"
                  style={{
                    border: paymentMethod === 'momo' ? '2px solid #2a63e8' : '1px solid #cbd5e1',
                    backgroundColor: paymentMethod === 'momo' ? '#eef2ff' : '#fff',
                    fontWeight: 700,
                  }}
                  onClick={() => setPaymentMethod('momo')}
                >
                  📱 Ví MoMo
                </button>
              </div>
            </div>

            {/* QR Code & Transfer Details */}
            {loading || !transaction ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div className="admin-spinner" style={{ margin: '0 auto 12px auto' }}></div>
                <p>Đang khởi tạo mã QR thanh toán...</p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', backgroundColor: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '28px' }}>
                {transaction.qr_url && (
                  <div style={{ marginBottom: '16px' }}>
                    <img
                      src={transaction.qr_url}
                      alt="VietQR Code"
                      style={{ width: '220px', height: '220px', borderRadius: '12px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                )}

                <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '4px' }}>Mã Nội Dung Chuyển Khoản:</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2a63e8', letterSpacing: '1px', fontFamily: 'monospace' }}>
                  {transaction.payment_code}
                </div>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px', margin: 0 }}>
                  Vui lòng giữ nguyên nội dung chuyển khoản để Backend tự động khớp lệnh.
                </p>
              </div>
            )}

            {/* Submit Verification Button */}
            <button
              onClick={handleVerifyClick}
              disabled={isVerifying || !transaction}
              className="btn-admin-primary"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '9999px',
                fontSize: '1.1rem',
                backgroundColor: '#16a34a',
                boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
              }}
            >
              {isVerifying ? 'Backend Đang Xác Minh Giao Dịch...' : '✓ Tôi Đã Thanh Toán - Xác Minh Ngay'}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default PaymentPage
