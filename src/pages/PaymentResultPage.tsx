import React from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import CloudIcon from '../assets/Cloud.svg'
import '../styles/pages/progress.css'

export const PaymentResultPage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state as { status?: string; planName?: string }) || {}

  const isSuccess = state.status === 'success'

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
              ← Về trang tài khoản
            </Link>

            <h1 className="progress-hero-title">KẾT QUẢ XÁC MINH THANH TOÁN</h1>
            <p className="progress-hero-subtitle">
              Kết quả xác minh giao dịch được trả về trực tiếp từ Backend API.
            </p>
          </div>
        </div>

        <div className="progress-hero-wave"></div>
      </section>

      {/* Main Content Section */}
      <main className="progress-main-section" style={{ padding: '40px 20px 80px 20px' }}>
        <div className="progress-container" style={{ maxWidth: '600px' }}>
          <div className="admin-card" style={{ padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>{isSuccess ? '🎉' : '❌'}</div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: isSuccess ? '#15803d' : '#b91c1c', margin: '0 0 12px 0' }}>
              {isSuccess ? 'Kích Hoạt Gói Dịch Vụ Thành Công!' : 'Chưa Nhận Được Xác Minh Thanh Toán'}
            </h2>

            <p style={{ color: '#475569', fontSize: '1rem', marginBottom: '32px', lineHeight: 1.6 }}>
              {isSuccess
                ? `Chúc mừng bạn! Backend đã xác minh thành công giao dịch và nâng cấp tài khoản của bạn lên Gói ${state.planName || 'PREMIUM'}. Tất cả các tính năng AI và bài tập nâng cao đã được mở khóa.`
                : 'Backend chưa thể khớp lệnh giao dịch thanh toán này. Nếu bạn đã thực hiện chuyển khoản, vui lòng đợi ít phút hoặc nhấn xác minh lại.'}
            </p>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {isSuccess ? (
                <>
                  <button
                    className="btn-admin-secondary"
                    style={{ padding: '12px 24px', borderRadius: '9999px' }}
                    onClick={() => navigate('/subscription')}
                  >
                    Xem Trạng Thái Gói
                  </button>

                  <button
                    className="btn-admin-primary"
                    style={{ padding: '12px 28px', borderRadius: '9999px', backgroundColor: '#16a34a' }}
                    onClick={() => navigate('/levels')}
                  >
                    Bắt Đầu Học Bài Nâng Cao ➔
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn-admin-secondary"
                    style={{ padding: '12px 24px', borderRadius: '9999px' }}
                    onClick={() => navigate('/pricing')}
                  >
                    Quay Lại Bảng Giá
                  </button>

                  <button
                    className="btn-admin-primary"
                    style={{ padding: '12px 28px', borderRadius: '9999px' }}
                    onClick={() => navigate('/subscription')}
                  >
                    Thử Lại Sau
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default PaymentResultPage
