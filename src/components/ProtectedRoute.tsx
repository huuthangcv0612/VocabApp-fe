import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <main className="auth-page">
        <section className="auth-page__container" style={{ textAlign: 'center' }}>
          <h1 className="auth-page__title">Đang tải...</h1>
          <p className="auth-page__subtitle">Đang khôi phục phiên đăng nhập của bạn.</p>
        </section>
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
