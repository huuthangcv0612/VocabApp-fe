import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function AdminRoute() {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  // 1. Phải chờ fetching restoreSession / /api/auth/me xong mới kiểm tra
  if (loading) {
    return (
      <main className="auth-page">
        <section className="auth-page__container" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
          <h1 className="auth-page__title" style={{ fontSize: '1.4rem' }}>Đang xác thực quyền Admin...</h1>
          <p className="auth-page__subtitle">Vui lòng chờ trong giây lát.</p>
        </section>
      </main>
    )
  }

  // 2. Nếu chưa đăng nhập -> Chuyển về trang Login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // 3. Nếu role không phải admin -> Mới hiển thị Từ chối truy cập 403
  if (user.role !== 'admin') {
    return (
      <main className="auth-page">
        <section className="auth-page__container" style={{ textAlign: 'center', maxWidth: '480px', padding: '40px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⛔</div>
          <h1 className="auth-page__title" style={{ color: '#d90000', fontSize: '1.6rem' }}>
            Truy Cập Bị Từ Chối
          </h1>
          <p className="auth-page__subtitle" style={{ marginBottom: '1.5rem', color: '#475569' }}>
            Tài khoản <strong>{user.email || user.name}</strong> không có quyền truy cập vào bảng điều khiển Admin.
          </p>
          <button
            onClick={() => {
              window.location.href = '/'
            }}
            style={{
              display: 'inline-block',
              padding: '10px 24px',
              backgroundColor: '#2A63E8',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Quay Về Trang Chủ
          </button>
        </section>
      </main>
    )
  }

  // 4. Đúng là Admin -> Cho phép hiển thị Admin Dashboard
  return <Outlet />
}
