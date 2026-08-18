import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import '../../styles/pages/admin.css'
import DeutschUpLogo from '../../assets/DEUTSCHUP.svg'

interface AdminLayoutProps {
  title: string
  children: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ title, children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src={DeutschUpLogo} alt="DeutschUp" className="admin-brand-logo-img" />
          <span className="admin-brand-badge">ADMIN</span>
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin" end className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <span className="admin-nav-icon">📊</span>
            <span>Tổng Quan</span>
          </NavLink>

          <NavLink to="/admin/questions" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <span className="admin-nav-icon">❓</span>
            <span>Ngân Hàng Câu Hỏi</span>
          </NavLink>

          <NavLink to="/admin/tests" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <span className="admin-nav-icon">📝</span>
            <span>Quản Lý Đề Test</span>
          </NavLink>

          <NavLink to="/admin/users" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <span className="admin-nav-icon">👥</span>
            <span>Quản Lý Người Dùng</span>
          </NavLink>

          <NavLink to="/admin/results" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <span className="admin-nav-icon">🎓</span>
            <span>Kết Quả Học Viên</span>
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <NavLink to="/" className="admin-exit-link">
            <span>🏠</span>
            <span>Về Trang Học Viên</span>
          </NavLink>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        <header className="admin-header">
          <h1 className="admin-header-title">{title}</h1>

          <div className="admin-header-user">
            <div className="admin-user-info">
              <span className="admin-user-name">{user?.name || 'Admin'}</span>
              <span className="admin-user-role">{user?.role || 'admin'}</span>
            </div>
            <button onClick={handleLogout} className="admin-logout-btn">
              Đăng Xuất
            </button>
          </div>
        </header>

        <main className="admin-body">{children}</main>
      </div>
    </div>
  )
}

export default AdminLayout
